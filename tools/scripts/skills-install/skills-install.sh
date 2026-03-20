#!/usr/bin/env bash

set -euo pipefail

DEFAULT_REPO_SLUG="bahayonghang/my-claude-code-settings"
REPO_SLUG="${SKILLS_INSTALL_REPO:-${DEFAULT_REPO_SLUG}}"
REPO_REF="${SKILLS_INSTALL_REF:-main}"
RAW_BASE="${SKILLS_INSTALL_RAW_BASE:-https://raw.githubusercontent.com/${REPO_SLUG}/${REPO_REF}}"
RAW_BASE="${RAW_BASE%/}"
FIRST_PARTY_SOURCE="${REPO_SLUG}/content/skills"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

NODE_BIN=""
NPX_BIN=""
INSTALLED_NAMES=()
CANDIDATE_LINES=()
SELECTED_INDICES=()
SELECTED_LINES=()

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

resolve_command() {
  local candidate
  for candidate in "$@"; do
    if command_exists "${candidate}"; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  return 1
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

print_header() {
  printf '\n== %s ==\n' "$1"
}

assert_prerequisites() {
  NODE_BIN="$(resolve_command node nodejs)"
  NPX_BIN="$(resolve_command npx)"

  [[ -n "${NODE_BIN}" ]] || die "node is required because the installer uses npx skills."
  [[ -n "${NPX_BIN}" ]] || die "npx is required because the installer uses npx skills."
}

choose_scope() {
  local choice
  while true; do
    print_header "Install Scope" >&2
    printf '1. Project (current working directory: %s)\n' "$(pwd)" >&2
    printf '2. Global\n' >&2
    read -r -p "Choose scope [1-2]: " choice
    case "${choice}" in
      1) printf 'project\n'; return 0 ;;
      2) printf 'global\n'; return 0 ;;
      *) printf 'Please enter 1 or 2.\n' >&2 ;;
    esac
  done
}

choose_mode() {
  local choice
  while true; do
    print_header "Install Mode" >&2
    printf '1. Install first-party skills from GitHub source\n' >&2
    printf '2. Install third-party skills from external-skills registry\n' >&2
    read -r -p "Choose mode [1-2]: " choice
    case "${choice}" in
      1) printf 'first_party\n'; return 0 ;;
      2) printf 'external\n'; return 0 ;;
      *) printf 'Please enter 1 or 2.\n' >&2 ;;
    esac
  done
}

load_installed_names() {
  local scope="$1"
  local outfile="$2"
  local raw_file="${TMP_DIR}/installed-raw.json"
  local args=("-y" "skills" "ls" "--json")

  if [[ "${scope}" == "global" ]]; then
    args+=("-g")
  fi

  if ! "${NPX_BIN}" "${args[@]}" >"${raw_file}" 2>"${TMP_DIR}/installed-error.log"; then
    cat "${TMP_DIR}/installed-error.log" >&2
    die "failed to inspect installed skills for scope '${scope}'."
  fi

  "${NODE_BIN}" - "${raw_file}" >"${outfile}" <<'NODE'
const fs = require("fs");

const rawPath = process.argv[2];
const raw = fs.readFileSync(rawPath, "utf8");

let data;
try {
  data = JSON.parse(raw);
} catch (error) {
  console.error(`Failed to parse npx skills ls JSON: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("Expected npx skills ls --json to return an array.");
  process.exit(1);
}

for (const item of data) {
  if (item && typeof item.name === "string") {
    const name = item.name.trim();
    if (name) {
      process.stdout.write(`${name}\n`);
    }
  }
}
NODE
}

read_installed_names() {
  local file="$1"
  local line

  INSTALLED_NAMES=()
  while IFS= read -r line || [[ -n "${line}" ]]; do
    INSTALLED_NAMES+=("${line}")
  done <"${file}"
}

show_installed_summary() {
  local limit=10
  local index=0
  local name

  print_header "Installed Skills Detected"
  printf 'Count: %d\n' "${#INSTALLED_NAMES[@]}"
  if [[ "${#INSTALLED_NAMES[@]}" -eq 0 ]]; then
    printf 'No installed skills found in the selected scope.\n'
    return 0
  fi

  for name in "${INSTALLED_NAMES[@]}"; do
    printf ' - %s\n' "${name}"
    index=$((index + 1))
    if [[ "${index}" -ge "${limit}" ]]; then
      break
    fi
  done

  if [[ "${#INSTALLED_NAMES[@]}" -gt "${limit}" ]]; then
    printf ' ... and %d more\n' "$(( ${#INSTALLED_NAMES[@]} - limit ))"
  fi
}

load_candidates() {
  local mode="$1"
  local scope="$2"
  local installed_file="$3"
  local outfile="$4"

  "${NODE_BIN}" - "${RAW_BASE}" "${mode}" "${scope}" "${installed_file}" >"${outfile}" <<'NODE'
const fs = require("fs");
const http = require("http");
const https = require("https");

const [rawBase, mode, scope, installedPath] = process.argv.slice(2);

function readInstalledNames(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return new Set(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unquoteToml(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\t/g, "\t");
}

function buildUrl(relativePath) {
  return `${rawBase}/${relativePath.replace(/^\/+/, "")}`;
}

function fetchText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    const request = client.get(url, (response) => {
      const statusCode = response.statusCode || 0;

      if ([301, 302, 303, 307, 308].includes(statusCode) && response.headers.location) {
        response.resume();
        if (redirectCount >= 5) {
          reject(new Error(`Too many redirects while fetching ${url}`));
          return;
        }

        const nextUrl = new URL(response.headers.location, url).toString();
        resolve(fetchText(nextUrl, redirectCount + 1));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`HTTP ${statusCode} while fetching ${url}`));
          return;
        }
        resolve(body);
      });
    });

    request.on("error", reject);
  });
}

function extractTableBlocks(content, tableName) {
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const tableMatch = trimmed.match(/^\[\[([A-Za-z0-9_-]+)\]\]$/);
    if (tableMatch) {
      if (current) {
        blocks.push(current.join("\n"));
        current = null;
      }
      if (tableMatch[1] === tableName) {
        current = [];
      }
      continue;
    }

    if (current) {
      current.push(line);
    }
  }

  if (current) {
    blocks.push(current.join("\n"));
  }

  return blocks;
}

function extractTomlString(block, key) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*"((?:\\\\.|[^"])*)"\\s*$`, "m"));
  return match ? unquoteToml(match[1]) : "";
}

function extractTomlBoolean(block, key, fallback) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*(true|false)\\s*$`, "m"));
  if (!match) {
    return fallback;
  }
  return match[1] === "true";
}

function splitInlineTable(content) {
  const segments = [];
  let current = "";
  let inQuote = false;
  let escape = false;

  for (const char of content) {
    if (escape) {
      current += char;
      escape = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escape = true;
      continue;
    }
    if (char === '"') {
      current += char;
      inQuote = !inQuote;
      continue;
    }
    if (char === "," && !inQuote) {
      if (current.trim()) {
        segments.push(current.trim());
      }
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) {
    segments.push(current.trim());
  }

  return segments;
}

function extractInlineTable(block, key) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*\\{(.*)\\}\\s*$`, "m"));
  if (!match) {
    return {};
  }

  const result = {};
  for (const segment of splitInlineTable(match[1])) {
    const pairMatch = segment.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!pairMatch) {
      continue;
    }
    const field = pairMatch[1];
    const rawValue = pairMatch[2].trim();
    const quoted = rawValue.match(/^"(.*)"$/);
    result[field] = quoted ? unquoteToml(quoted[1]) : rawValue;
  }
  return result;
}

async function loadFirstPartyCandidates(installed) {
  const catalogRaw = await fetchText(buildUrl("content/skills/catalog.json"));
  let catalog;
  try {
    catalog = JSON.parse(catalogRaw);
  } catch (error) {
    throw new Error(`Failed to parse content/skills/catalog.json: ${error.message}`);
  }

  if (!catalog || !Array.isArray(catalog.skills)) {
    throw new Error("Expected content/skills/catalog.json to contain a skills array.");
  }

  return catalog.skills
    .filter((item) => item && typeof item.name === "string" && !installed.has(item.name))
    .map((item) => ({
      key: item.name,
      kind: "first_party",
      name: item.name,
      category: normalizeText(item.category),
      description: normalizeText(item.description),
      packageRef: "",
      skillFlag: "",
      projectOnly: false,
    }));
}

async function loadExternalCandidates(installed) {
  const indexContent = await fetchText(buildUrl("content/skills/external-skills/index.toml"));
  const categoryBlocks = extractTableBlocks(indexContent, "categories");
  const items = [];

  for (const categoryBlock of categoryBlocks) {
    const categoryId = extractTomlString(categoryBlock, "id");
    const categoryLabel = extractTomlString(categoryBlock, "label");
    const categoryFile = extractTomlString(categoryBlock, "file");

    if (!categoryId || !categoryFile) {
      continue;
    }

    const fragmentContent = await fetchText(buildUrl(`content/skills/external-skills/${categoryFile}`));
    const skillBlocks = extractTableBlocks(fragmentContent, "skills");

    for (const block of skillBlocks) {
      const name = extractTomlString(block, "name");
      const install = extractInlineTable(block, "install");
      const packageRef = install.package_ref || "";
      const skillFlag = install.skill_flag || "";
      const key = skillFlag || name;
      const projectOnly = extractTomlBoolean(block, "project_only", false);

      if (!name || !packageRef || !key) {
        continue;
      }
      if (scope === "global" && projectOnly) {
        continue;
      }
      if (installed.has(key)) {
        continue;
      }

      items.push({
        key,
        kind: "external",
        name,
        category: categoryLabel || categoryId,
        description: normalizeText(extractTomlString(block, "description")),
        packageRef,
        skillFlag,
        projectOnly,
      });
    }
  }

  return items;
}

(async () => {
  const installed = readInstalledNames(installedPath);
  const candidates = mode === "external"
    ? await loadExternalCandidates(installed)
    : await loadFirstPartyCandidates(installed);

  candidates
    .sort((left, right) => {
      const categoryCompare = left.category.localeCompare(right.category);
      return categoryCompare !== 0 ? categoryCompare : left.name.localeCompare(right.name);
    })
    .forEach((item) => {
      process.stdout.write(
        [
          item.key,
          item.kind,
          item.name,
          item.category,
          normalizeText(item.description),
          item.packageRef,
          item.skillFlag,
          item.projectOnly ? "true" : "false",
        ].join("\t") + "\n"
      );
    });
})().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
NODE
}

read_candidate_lines() {
  local file="$1"
  local line

  CANDIDATE_LINES=()
  while IFS= read -r line || [[ -n "${line}" ]]; do
    CANDIDATE_LINES+=("${line}")
  done <"${file}"
}

show_candidate_preview() {
  local limit=15
  local idx=0
  local line key kind name category description package_ref skill_flag project_only

  print_header "Available Candidates"
  for line in "${CANDIDATE_LINES[@]}"; do
    IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
    if [[ "${kind}" == "external" ]]; then
      printf '%2d. [%s] %s / %s (%s)\n' "$((idx + 1))" "${kind}" "${category}" "${name}" "${package_ref}"
    else
      printf '%2d. [%s] %s / %s\n' "$((idx + 1))" "${kind}" "${category}" "${name}"
    fi
    idx=$((idx + 1))
    if [[ "${idx}" -ge "${limit}" ]]; then
      break
    fi
  done

  if [[ "${#CANDIDATE_LINES[@]}" -gt "${limit}" ]]; then
    printf ' ... and %d more\n' "$(( ${#CANDIDATE_LINES[@]} - limit ))"
  fi
}

select_candidate_indices_fzf() {
  local display_lines=()
  local index=0
  local line key kind name category description package_ref skill_flag project_only
  local selected

  SELECTED_INDICES=()

  for line in "${CANDIDATE_LINES[@]}"; do
    IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
    if [[ "${kind}" == "external" ]]; then
      display_lines+=("$(printf '%d\t[%s] %s / %s\t%s\t%s' "$((index + 1))" "${kind}" "${category}" "${name}" "${package_ref}" "${description:-No description}")")
    else
      display_lines+=("$(printf '%d\t[%s] %s / %s\t%s' "$((index + 1))" "${kind}" "${category}" "${name}" "${description:-No description}")")
    fi
    index=$((index + 1))
  done

  while IFS= read -r selected; do
    [[ -z "${selected}" ]] && continue
    SELECTED_INDICES+=("${selected}")
  done < <(printf '%s\n' "${display_lines[@]}" | fzf --multi --prompt="Select skills > " --with-nth=2.. | cut -f1 || true)
}

select_candidate_indices_manual() {
  local index=0
  local input
  local raw
  local line key kind name category description package_ref skill_flag project_only

  SELECTED_INDICES=()

  print_header "Select Skills"
  for line in "${CANDIDATE_LINES[@]}"; do
    IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
    if [[ "${kind}" == "external" ]]; then
      printf '%3d. [%s] %s / %s (%s)\n' "$((index + 1))" "${kind}" "${category}" "${name}" "${package_ref}"
    else
      printf '%3d. [%s] %s / %s\n' "$((index + 1))" "${kind}" "${category}" "${name}"
    fi
    if [[ -n "${description}" ]]; then
      printf '     %s\n' "${description}"
    fi
    index=$((index + 1))
  done

  printf '\n'
  read -r -p "Enter comma-separated numbers, or press Enter to cancel: " input
  if [[ -z "${input// }" ]]; then
    return 0
  fi

  while IFS= read -r raw; do
    [[ -z "${raw}" ]] && continue
    SELECTED_INDICES+=("${raw}")
  done < <(printf '%s\n' "${input}" | tr ', ' '\n' | sed '/^$/d')
}

resolve_selected_lines() {
  local max="${#CANDIDATE_LINES[@]}"
  local seen="|"
  local raw

  SELECTED_LINES=()

  for raw in "${SELECTED_INDICES[@]}"; do
    [[ -z "${raw}" ]] && continue
    [[ "${raw}" =~ ^[0-9]+$ ]] || die "invalid selection '${raw}'."
    [[ "${raw}" -ge 1 && "${raw}" -le "${max}" ]] || die "selection '${raw}' is out of range."

    case "${seen}" in
      *"|${raw}|"*) continue ;;
    esac

    seen="${seen}${raw}|"
    SELECTED_LINES+=("${CANDIDATE_LINES[$((raw - 1))]}")
  done
}

build_first_party_command() {
  local scope="$1"
  shift
  local names=("$@")
  local cmd=("${NPX_BIN}" "-y" "skills" "add" "${FIRST_PARTY_SOURCE}")
  local name

  if [[ "${scope}" == "global" ]]; then
    cmd+=("-g")
  fi

  for name in "${names[@]}"; do
    cmd+=("--skill" "${name}")
  done

  cmd+=("-y")
  printf '%s\0' "${cmd[@]}"
}

build_external_command_specs() {
  local line key kind name category description package_ref skill_flag project_only
  local packages=()
  local package_flags=()
  local package_full=()
  local idx=-1
  local i

  for line in "${SELECTED_LINES[@]}"; do
    IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
    [[ -z "${package_ref}" ]] && continue

    idx=-1
    for ((i = 0; i < ${#packages[@]}; i++)); do
      if [[ "${packages[$i]}" == "${package_ref}" ]]; then
        idx="${i}"
        break
      fi
    done

    if [[ "${idx}" -lt 0 ]]; then
      packages+=("${package_ref}")
      package_flags+=("")
      package_full+=("false")
      idx=$(( ${#packages[@]} - 1 ))
    fi

    if [[ -z "${skill_flag}" ]]; then
      package_full[$idx]="true"
      continue
    fi

    if [[ "${package_full[$idx]}" == "false" ]]; then
      case "|${package_flags[$idx]}|" in
        *"|${skill_flag}|"*) ;;
        *)
          if [[ -n "${package_flags[$idx]}" ]]; then
            package_flags[$idx]="${package_flags[$idx]}|${skill_flag}"
          else
            package_flags[$idx]="${skill_flag}"
          fi
          ;;
      esac
    fi
  done

  for ((i = 0; i < ${#packages[@]}; i++)); do
    printf '%s\t%s\t%s\n' "${packages[$i]}" "${package_flags[$i]}" "${package_full[$i]}"
  done
}

format_command_display() {
  local rendered=()
  local part
  for part in "$@"; do
    rendered+=("$(printf '%q' "${part}")")
  done
  printf '%s\n' "${rendered[*]}"
}

run_command_array() {
  "$@"
}

main() {
  local scope mode installed_file candidates_file line

  assert_prerequisites

  scope="$(choose_scope)"

  installed_file="${TMP_DIR}/installed.txt"
  load_installed_names "${scope}" "${installed_file}"
  read_installed_names "${installed_file}"
  show_installed_summary

  mode="$(choose_mode)"

  candidates_file="${TMP_DIR}/candidates.tsv"
  load_candidates "${mode}" "${scope}" "${installed_file}" "${candidates_file}"
  read_candidate_lines "${candidates_file}"

  if [[ "${#CANDIDATE_LINES[@]}" -eq 0 ]]; then
    print_header "Nothing To Install"
    printf 'No installable candidates remain for mode=%s scope=%s.\n' "${mode}" "${scope}"
    exit 0
  fi

  show_candidate_preview

  if command_exists fzf; then
    select_candidate_indices_fzf
  else
    select_candidate_indices_manual
  fi

  if [[ "${#SELECTED_INDICES[@]}" -eq 0 ]]; then
    print_header "No Selection"
    printf 'No skills selected. Nothing to do.\n'
    exit 0
  fi

  resolve_selected_lines

  print_header "Selected Skills"
  local key kind name category description package_ref skill_flag project_only
  for line in "${SELECTED_LINES[@]}"; do
    IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
    if [[ "${kind}" == "external" ]]; then
      printf ' - %s / %s (%s)\n' "${category}" "${name}" "${package_ref}"
    else
      printf ' - %s / %s\n' "${category}" "${name}"
    fi
  done

  local failures=()

  if [[ "${mode}" == "first_party" ]]; then
    local first_party_names=()
    local token
    local cmd=()

    for line in "${SELECTED_LINES[@]}"; do
      IFS=$'\t' read -r key kind name category description package_ref skill_flag project_only <<<"${line}"
      first_party_names+=("${name}")
    done

    while IFS= read -r -d '' token; do
      cmd+=("${token}")
    done < <(build_first_party_command "${scope}" "${first_party_names[@]}")

    print_header "Executing Command"
    format_command_display "${cmd[@]}"
    if ! run_command_array "${cmd[@]}"; then
      failures+=("first-party GitHub install")
    fi
  else
    local spec package flags full_install ext_flag
    while IFS= read -r spec || [[ -n "${spec}" ]]; do
      [[ -z "${spec}" ]] && continue
      IFS=$'\t' read -r package flags full_install <<<"${spec}"

      local cmd=("${NPX_BIN}" "-y" "skills" "add" "${package}")
      if [[ "${scope}" == "global" ]]; then
        cmd+=("-g")
      fi

      if [[ "${full_install}" != "true" && -n "${flags}" ]]; then
        local old_ifs="${IFS}"
        IFS='|'
        for ext_flag in ${flags}; do
          [[ -z "${ext_flag}" ]] && continue
          cmd+=("--skill" "${ext_flag}")
        done
        IFS="${old_ifs}"
      fi

      cmd+=("-y")

      print_header "Executing Command"
      format_command_display "${cmd[@]}"
      if ! run_command_array "${cmd[@]}"; then
        failures+=("${package}")
      fi
    done < <(build_external_command_specs)
  fi

  print_header "Install Summary"
  if [[ "${#failures[@]}" -eq 0 ]]; then
    printf 'All selected installs completed successfully.\n'
    exit 0
  fi

  printf 'Completed with %d failure(s):\n' "${#failures[@]}"
  local failure
  for failure in "${failures[@]}"; do
    printf ' - %s\n' "${failure}"
  done
  exit 1
}

main "$@"
