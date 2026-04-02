#!/usr/bin/env bash
# Scan all installed skills and extract lightweight metadata.
# Output: JSON array

SKILLS_DIR="${HOME}/.claude/skills"

trim_quotes() {
  local value="$1"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

normalize_space() {
  printf '%s' "$1" | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//'
}

escape_json() {
  printf '%s' "$1" | python -c "import json,sys; print(json.dumps(sys.stdin.read())[1:-1], end='')"
}

short_desc() {
  local desc="$1"
  local first_sentence
  first_sentence=$(printf '%s' "$desc" | sed 's/。.*//' | sed 's/\. .*//')
  printf '%s' "${first_sentence:-$desc}" | cut -c1-80
}

infer_category() {
  local text
  text=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')

  if [[ "$text" =~ analy|research|read|paper|study|learn|summar|interpret ]]; then
    printf 'cognitive-analysis'
  elif [[ "$text" =~ write|card|slide|doc|screenshot|theme|format|present ]]; then
    printf 'document-expression'
  elif [[ "$text" =~ code|build|debug|test|refactor|lint|api|tool|script ]]; then
    printf 'development-implementation'
  elif [[ "$text" =~ workflow|sync|web|browser|fetch|search|agent|automation ]]; then
    printf 'workflow-integration'
  elif [[ "$text" =~ setup|install|config|memory|skill|meta|manage|review ]]; then
    printf 'system-maintenance'
  else
    printf 'uncategorized'
  fi
}

normalize_invocable() {
  local value
  value=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
  case "$value" in
    true|yes|1)
      printf 'true'
      ;;
    false|no|0|"")
      printf 'false'
      ;;
    *)
      printf 'false'
      ;;
  esac
}

flush_multiline() {
  if [[ "$current_key" == "description" ]]; then
    description=$(normalize_space "$(printf '%s\n' "${multiline_buffer[@]}")")
  fi
  current_key=""
  multiline_buffer=()
}

parse_field_line() {
  local line="$1"
  local key="${line%%:*}"
  local value="${line#*:}"
  value="${value#"${value%%[![:space:]]*}"}"

  case "$key" in
    name)
      if [[ -n "$value" ]]; then
        name=$(trim_quotes "$value")
      fi
      ;;
    version)
      if [[ -n "$value" ]]; then
        version=$(trim_quotes "$value")
      fi
      ;;
    user_invocable)
      if [[ -n "$value" ]]; then
        invocable=$(trim_quotes "$value")
      fi
      ;;
    category)
      if [[ -n "$value" ]]; then
        category=$(trim_quotes "$value")
      fi
      ;;
    description)
      if [[ "$value" == '|'* ]] || [[ "$value" == '>'* ]]; then
        current_key="description"
      elif [[ -n "$value" ]]; then
        description=$(trim_quotes "$value")
      fi
      ;;
  esac
}

if [[ ! -d "$SKILLS_DIR" ]]; then
  printf '[]\n'
  exit 0
fi

first=1
printf '[\n'

for skill_dir in "$SKILLS_DIR"/*/; do
  [[ -d "$skill_dir" ]] || continue

  skill_file="$skill_dir/SKILL.md"
  [[ -f "$skill_file" ]] || continue

  dir_name=$(basename "$skill_dir")
  clean=$(tr -d '\r' < "$skill_file")
  frontmatter=$(printf '%s\n' "$clean" | sed -n '/^---$/,/^---$/p' | sed '1d;$d')

  name="$dir_name"
  version="-"
  invocable="false"
  category=""
  description=""
  current_key=""
  multiline_buffer=()

  if [[ -n "$frontmatter" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ -n "$current_key" ]]; then
        if [[ "$line" =~ ^[^[:space:]][A-Za-z_][A-Za-z0-9_]*: ]]; then
          flush_multiline
          parse_field_line "$line"
        else
          multiline_buffer+=("${line#"${line%%[![:space:]]*}"}")
        fi
      elif [[ "$line" =~ ^[^[:space:]][A-Za-z_][A-Za-z0-9_]*: ]]; then
        parse_field_line "$line"
      fi
    done <<< "$frontmatter"

    if [[ -n "$current_key" ]]; then
      flush_multiline
    fi
  else
    desc_line=$(printf '%s\n' "$clean" | grep -m1 '^description:')
    if [[ -n "$desc_line" ]]; then
      description=$(trim_quotes "${desc_line#description:}")
    fi
  fi

  description=$(normalize_space "$description")
  short=$(short_desc "$description")
  : "${description:=}"
  : "${short:=${description:-}}"
  : "${version:=-}"
  invocable=$(normalize_invocable "$invocable")

  if [[ -z "$category" ]]; then
    category=$(infer_category "$name $description")
  fi
  : "${category:=uncategorized}"

  if (( first )); then
    first=0
  else
    printf ',\n'
  fi

  printf '  {"name":"%s","version":"%s","invocable":%s,"desc":"%s","category":"%s"}' \
    "$(escape_json "$name")" \
    "$(escape_json "$version")" \
    "$invocable" \
    "$(escape_json "$short")" \
    "$(escape_json "$category")"
done

printf '\n]\n'
