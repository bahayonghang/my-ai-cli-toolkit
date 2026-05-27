# Interaction Cookbook

Ten interaction recipes for offline HTML artifacts. Native HTML elements (`<details>`, `<dialog>`, `<input type="search">`, `<button>`) come first; ARIA fills the gaps where native semantics fall short. Every recipe includes a no-JS baseline so the artifact is still readable when scripts are blocked or fail.

## Principles

- **Native first.** Pick `<details>` over a custom disclosure, `<dialog>` over a div-with-overlay, `<button>` over `<a role="button">`. The browser already handles focus, keyboard, and screen-reader semantics.
- **Progressive enhancement.** Write HTML that works without JS. JS sharpens behavior (filter, sort, animate) but never gatekeeps content.
- **Keyboard parity.** Every click target must be reachable via Tab and operable via Enter/Space. Custom widgets follow the [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) for roving tabindex, arrow-key behavior, and `aria-*` state.
- **Visible focus.** Never remove `:focus-visible`; the starter ring uses a high-contrast accent and is independent of brand color.
- **State, not styling, drives behavior.** `aria-pressed`, `aria-expanded`, `aria-selected`, `aria-sort` are the source of truth; CSS reads them.
- **Local-only persistence.** When state must survive a reload (theme, filter, last open accordion), use `localStorage`. Never call the network.

## Recipe 1 — Filter chip group

Use for review severity filters, status filters in dashboards, or tag pickers. Multiple chips can be active at once.

```html
<div class="filter-bar" role="group" aria-label="Filter findings by severity">
  <button
    type="button"
    class="filter-chip is-active"
    aria-pressed="true"
    data-filter="*"
  >
    All
  </button>
  <button
    type="button"
    class="filter-chip"
    aria-pressed="false"
    data-filter="blocker"
  >
    Blocker
  </button>
  <button
    type="button"
    class="filter-chip"
    aria-pressed="false"
    data-filter="suggestion"
  >
    Suggestion
  </button>
  <button
    type="button"
    class="filter-chip"
    aria-pressed="false"
    data-filter="info"
  >
    Info
  </button>
  <p class="filter-count" aria-live="polite">Showing all findings.</p>
</div>

<ul id="findings-list">
  <li data-tags="blocker">…</li>
  <li data-tags="suggestion">…</li>
  <li data-tags="info">…</li>
</ul>

<script>
  (() => {
    const bar = document.querySelector(".filter-bar");
    if (!bar) return;
    const chips = bar.querySelectorAll("[data-filter]");
    const count = bar.querySelector(".filter-count");
    const items = document.querySelectorAll("#findings-list > li");
    const active = new Set(["*"]);

    function apply() {
      const showAll = active.has("*");
      let shown = 0;
      items.forEach((li) => {
        const tags = (li.dataset.tags || "").split(/\s+/);
        const match = showAll || tags.some((t) => active.has(t));
        li.hidden = !match;
        if (match) shown++;
      });
      count.textContent = showAll
        ? `Showing all ${shown} findings.`
        : `Showing ${shown} of ${items.length} findings: ${[...active].join(", ")}.`;
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.filter;
        if (key === "*") {
          active.clear();
          active.add("*");
        } else {
          active.delete("*");
          active.has(key) ? active.delete(key) : active.add(key);
          if (active.size === 0) active.add("*");
        }
        chips.forEach((c) => {
          const on = active.has(c.dataset.filter);
          c.setAttribute("aria-pressed", on ? "true" : "false");
          c.classList.toggle("is-active", on);
        });
        apply();
      });
    });
  })();
</script>
```

Without JS, all items remain visible — the chip group is a non-interactive label set. The `aria-live="polite"` count region announces filter changes to screen reader users.

## Recipe 2 — Client-side search

Use for long evidence dossiers, review reports, or any artifact where a reader might Ctrl-F across structured content.

```html
<label class="search-label" for="page-search">Search the page</label>
<input
  id="page-search"
  type="search"
  autocomplete="off"
  placeholder="Try: schema, latency, oncall"
  aria-controls="searchable"
  aria-describedby="search-status"
/>
<p id="search-status" aria-live="polite" class="search-status">
  Type to filter; matches highlight in place.
</p>

<div id="searchable">
  <section data-searchable>…</section>
  <section data-searchable>…</section>
</div>

<script>
  (() => {
    const input = document.querySelector("#page-search");
    const status = document.querySelector("#search-status");
    const sections = document.querySelectorAll("[data-searchable]");
    if (!input || !sections.length) return;

    let raf = 0;
    input.addEventListener("input", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const q = input.value.trim().toLowerCase();
        let hits = 0;
        sections.forEach((sec) => {
          const text = sec.textContent.toLowerCase();
          const match = q.length === 0 || text.includes(q);
          sec.hidden = !match;
          if (match) hits++;
        });
        status.textContent =
          q.length === 0
            ? "Type to filter; matches highlight in place."
            : `${hits} section${hits === 1 ? "" : "s"} match "${q}".`;
      });
    });
  })();
</script>
```

The native `<input type="search">` gets a clear-X affordance in most browsers for free. `requestAnimationFrame` throttles work to one update per paint. For richer highlight-in-place, wrap matched substrings in `<mark>` after the filter pass.

## Recipe 3 — Sortable table

Use when readers might want to re-rank by any column. Builds on the `th[aria-sort]` markup that the starter already styles.

```html
<table class="sortable">
  <caption>
    Open PRs by service. Click any column header to sort.
  </caption>
  <thead>
    <tr>
      <th aria-sort="none"><button type="button">Service</button></th>
      <th aria-sort="descending" class="col--num">
        <button type="button">Open PRs</button>
      </th>
      <th aria-sort="none" class="col--num">
        <button type="button">Median age (h)</button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>checkout-api</td>
      <td class="col--num" data-value="43">43</td>
      <td class="col--num" data-value="38">38</td>
    </tr>
    <tr>
      <td>orders-service</td>
      <td class="col--num" data-value="26">26</td>
      <td class="col--num" data-value="22">22</td>
    </tr>
  </tbody>
</table>

<script>
  (() => {
    document.querySelectorAll("table.sortable").forEach((table) => {
      const headers = table.querySelectorAll("thead th");
      headers.forEach((th, idx) => {
        const btn = th.querySelector("button");
        if (!btn) return;
        btn.addEventListener("click", () => {
          const next =
            th.getAttribute("aria-sort") === "ascending"
              ? "descending"
              : "ascending";
          headers.forEach((h) => h.setAttribute("aria-sort", "none"));
          th.setAttribute("aria-sort", next);
          const rows = Array.from(table.tBodies[0].rows);
          rows.sort((a, b) => {
            const av =
              a.cells[idx].dataset.value ?? a.cells[idx].textContent.trim();
            const bv =
              b.cells[idx].dataset.value ?? b.cells[idx].textContent.trim();
            const an = Number(av),
              bn = Number(bv);
            const ord =
              !Number.isNaN(an) && !Number.isNaN(bn)
                ? an - bn
                : av.localeCompare(bv);
            return next === "ascending" ? ord : -ord;
          });
          const tbody = table.tBodies[0];
          rows.forEach((row) => tbody.appendChild(row));
        });
      });
    });
  })();
</script>
```

Wrapping the header label in a `<button>` makes it natively keyboard-operable. `data-value` on numeric cells lets you sort by the underlying number even when the cell shows formatted text ("$12,400").

## Recipe 4 — Tabs (APG pattern)

Use for "compare two views of the same thing" (before/after diagrams, light/dark previews, alt-text views of a chart). No native HTML element matches; implement the APG tablist pattern.

```html
<div class="tabs">
  <div role="tablist" aria-label="Architecture view">
    <button
      type="button"
      role="tab"
      id="tab-before"
      aria-selected="true"
      aria-controls="panel-before"
      tabindex="0"
    >
      Before
    </button>
    <button
      type="button"
      role="tab"
      id="tab-after"
      aria-selected="false"
      aria-controls="panel-after"
      tabindex="-1"
    >
      After
    </button>
  </div>
  <section role="tabpanel" id="panel-before" aria-labelledby="tab-before">
    …before diagram…
  </section>
  <section role="tabpanel" id="panel-after" aria-labelledby="tab-after" hidden>
    …after diagram…
  </section>
</div>

<script>
  (() => {
    document.querySelectorAll(".tabs").forEach((wrap) => {
      const tabs = Array.from(wrap.querySelectorAll('[role="tab"]'));
      const panels = tabs.map((t) =>
        document.getElementById(t.getAttribute("aria-controls")),
      );
      function select(i) {
        tabs.forEach((tab, idx) => {
          const on = idx === i;
          tab.setAttribute("aria-selected", on ? "true" : "false");
          tab.tabIndex = on ? 0 : -1;
          panels[idx].hidden = !on;
        });
        tabs[i].focus();
      }
      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => select(i));
        tab.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            select((i + 1) % tabs.length);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            select((i - 1 + tabs.length) % tabs.length);
          } else if (e.key === "Home") {
            e.preventDefault();
            select(0);
          } else if (e.key === "End") {
            e.preventDefault();
            select(tabs.length - 1);
          }
        });
      });
    });
  })();
</script>
```

The `tabindex` rotation ("roving tabindex") makes the entire tablist behave as a single Tab stop — readers Tab into the active tab and use arrow keys to move between siblings. Without JS, all panels are visible (remove the `hidden` attribute in your no-JS fallback CSS).

## Recipe 5 — Disclosure / accordion

Prefer native `<details>` unless you need cross-section coordination beyond what `name=` provides.

```html
<section class="faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Frequently asked questions</h2>
  <details name="faq">
    <summary>How do I run the validator?</summary>
    <p>
      Use <code>python scripts/check_html_artifact.py file.html</code> from the
      repo root.
    </p>
  </details>
  <details name="faq">
    <summary>Why is the page only one file?</summary>
    <p>
      Single-file HTML is portable, offline-safe, and surprise-free to email or
      paste into a ticket.
    </p>
  </details>
</section>

<style>
  /* Interop 2025: animate open/close where supported, otherwise pop instantly */
  @supports (interpolate-size: allow-keywords) {
    :root {
      interpolate-size: allow-keywords;
    }
    details::details-content {
      block-size: 0;
      overflow: clip;
      transition:
        block-size 0.25s ease,
        content-visibility 0.25s allow-discrete;
    }
    details[open]::details-content {
      block-size: auto;
    }
  }
</style>
```

The shared `name="faq"` makes the group behave like a traditional accordion (opening one closes the others) without any JS. The progressive-enhancement animation block uses [Interop 2025 `interpolate-size`](https://www.oidaisdes.org/lets-play-accordion.en/) — browsers that lack support simply skip the animation.

## Recipe 6 — Native `<dialog>` modal

Use for confirmations, "details" overlays, "share this link" prompts, or "view raw data" pop-ups in artifacts.

```html
<button type="button" data-open="confirm">Reset to sample data…</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <form method="dialog">
    <h2 id="confirm-title">Reset to sample data?</h2>
    <p>This discards your current edits. There is no undo.</p>
    <menu>
      <button value="cancel" autofocus>Cancel</button>
      <button value="confirm">Reset</button>
    </menu>
  </form>
</dialog>

<script>
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dlg = document.getElementById(btn.dataset.open);
      if (dlg && typeof dlg.showModal === "function") {
        dlg.returnValue = "";
        dlg.showModal();
      }
    });
  });
  document.querySelectorAll("dialog").forEach((dlg) => {
    // click-outside closes
    dlg.addEventListener("click", (e) => {
      const r = dlg.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        dlg.close("outside");
      }
    });
    dlg.addEventListener("close", () => {
      if (dlg.returnValue === "confirm") {
        // handle the user's confirm action here
      }
    });
  });
</script>
```

`showModal()` traps focus, supports ESC to close, and uses the native `::backdrop` pseudo-element. `form method="dialog"` closes the dialog when the form submits and exposes the chosen button's `value` via `dialog.returnValue` — no event-handler plumbing needed for the buttons themselves.

## Recipe 7 — Scroll-spy TOC

Use to keep the side TOC link in sync with the current section as the reader scrolls.

```html
<nav class="toc" aria-label="Sections">
  <strong>Sections</strong>
  <a href="#summary">Summary</a>
  <a href="#findings">Findings</a>
  <a href="#sources">Sources</a>
  <a href="#actions">Actions</a>
</nav>

<script>
  (() => {
    const links = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
    if (!links.length || !("IntersectionObserver" in window)) return;
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const targets = [...map.keys()]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry) => {
            const link = map.get(entry.target.id);
            if (!link) return;
            links.forEach((l) => l.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "location");
          });
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );

    targets.forEach((t) => observer.observe(t));
  })();
</script>
```

`aria-current="location"` is announced by screen readers as "current location" without requiring extra CSS. The starter template already styles `.toc a[aria-current="location"]` with the active accent.

## Recipe 8 — Theme / mode toggle

Lets readers override the system preference. Persists in `localStorage` only.

```html
<fieldset class="mode-toggle" role="group" aria-label="Color mode">
  <legend class="sr-only">Color mode</legend>
  <button type="button" data-mode="auto" aria-pressed="true">Auto</button>
  <button type="button" data-mode="light" aria-pressed="false">Light</button>
  <button type="button" data-mode="dark" aria-pressed="false">Dark</button>
</fieldset>

<script>
  (() => {
    const html = document.documentElement;
    const stored = (() => {
      try {
        return localStorage.getItem("artifact-mode");
      } catch {
        return null;
      }
    })();
    const initial = stored || "auto";
    apply(initial);

    document.querySelectorAll(".mode-toggle [data-mode]").forEach((btn) => {
      btn.addEventListener("click", () =>
        apply(btn.dataset.mode, /*persist*/ true),
      );
    });

    function apply(mode, persist) {
      if (mode === "auto") html.removeAttribute("data-mode");
      else html.setAttribute("data-mode", mode);
      document.querySelectorAll(".mode-toggle [data-mode]").forEach((b) => {
        b.setAttribute(
          "aria-pressed",
          b.dataset.mode === mode ? "true" : "false",
        );
      });
      if (persist) {
        try {
          if (mode === "auto") localStorage.removeItem("artifact-mode");
          else localStorage.setItem("artifact-mode", mode);
        } catch {
          /* private mode or storage full — ignore */
        }
      }
    }
  })();
</script>
```

The CSS token layer in the starter template already responds to `data-mode="light"` and `data-mode="dark"` attributes (and falls back to `prefers-color-scheme` when no attribute is set). The recipe just persists the user's override.

## Recipe 9 — Copy with feedback

Improves on the starter's basic copy button: falls back when clipboard API is blocked, announces via `aria-live`, and resets after a short delay.

```html
<button type="button" data-copy="#checklist" aria-describedby="copy-status">
  Copy checklist
</button>
<p id="copy-status" aria-live="polite"></p>

<script>
  (() => {
    const status = document.getElementById("copy-status");
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const target = document.querySelector(btn.dataset.copy);
        const text = target ? target.innerText.trim() : "";
        const orig = btn.textContent;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = Object.assign(document.createElement("textarea"), {
              value: text,
            });
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
          }
          btn.setAttribute("aria-pressed", "true");
          btn.textContent = "Copied";
          status &&
            (status.textContent = `${text.split("\n").length} lines copied to clipboard.`);
        } catch {
          status &&
            (status.textContent =
              "Clipboard unavailable — select and copy manually.");
        }
        setTimeout(() => {
          btn.removeAttribute("aria-pressed");
          btn.textContent = orig;
        }, 2500);
      });
    });
  })();
</script>
```

## Recipe 10 — Keyboard shortcuts

Use for narrative-deck navigation, quick filter toggles, or "press `?` to see all shortcuts" patterns.

```html
<dialog id="shortcuts" aria-labelledby="shortcuts-title">
  <h2 id="shortcuts-title">Keyboard shortcuts</h2>
  <dl>
    <dt><kbd>j</kbd></dt>
    <dd>Next section</dd>
    <dt><kbd>k</kbd></dt>
    <dd>Previous section</dd>
    <dt><kbd>/</kbd></dt>
    <dd>Focus search</dd>
    <dt><kbd>?</kbd></dt>
    <dd>Show this list</dd>
    <dt><kbd>Esc</kbd></dt>
    <dd>Close dialog</dd>
  </dl>
  <form method="dialog"><button autofocus>Close</button></form>
</dialog>

<script>
  (() => {
    const sections = Array.from(
      document.querySelectorAll("main > section[id]"),
    );
    const help = document.getElementById("shortcuts");
    const search = document.getElementById("page-search");

    function isTyping(target) {
      const tag = (target.tagName || "").toLowerCase();
      return (
        target.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      );
    }
    function jump(delta) {
      if (!sections.length) return;
      const y = window.scrollY + 1;
      const i = sections.findIndex((s) => s.offsetTop >= y);
      const next =
        sections[
          Math.max(
            0,
            Math.min(
              sections.length - 1,
              (i < 0 ? sections.length : i) + delta,
            ),
          )
        ];
      next?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    document.addEventListener("keydown", (e) => {
      if (isTyping(e.target)) return;
      if (e.key === "j") {
        e.preventDefault();
        jump(1);
      } else if (e.key === "k") {
        e.preventDefault();
        jump(-1);
      } else if (e.key === "/") {
        e.preventDefault();
        search?.focus();
      } else if (e.key === "?") {
        e.preventDefault();
        help?.showModal?.();
      }
    });
  })();
</script>
```

`isTyping` keeps shortcuts inactive while the reader is inside an input or textarea. ESC is handled natively by `<dialog>`; you do not need a key listener for it.

## Combining recipes

- **Code review report** = filter chips (recipe 1) + sortable table (recipe 3) + search (recipe 2) + copy with feedback (recipe 9).
- **Interactive JSON editor** = native `<dialog>` for "reset?" (recipe 6) + copy with feedback (recipe 9) + theme toggle (recipe 8).
- **Narrative deck** = tabs (recipe 4) for alt views + keyboard shortcuts (recipe 10) for j/k/?.
- **Long evidence dossier** = scroll-spy TOC (recipe 7) + client-side search (recipe 2) + disclosure (recipe 5) for collapsible source detail.

When a recipe stays out — when a static page is enough — skip it. Interaction added without a job to do is friction, not feature.
