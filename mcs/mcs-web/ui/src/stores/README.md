# Zustand Stores — Selector Discipline

This directory holds the app's Zustand stores. To prevent a class of
`Maximum update depth exceeded` (React error #185) bugs, follow the rules below
when writing selectors.

## Rule 1 — Selectors must return referentially stable values

**Bad** (every call returns a new array reference, which under Zustand v4/v5's
default `Object.is` equality causes the subscribed component to re-render on
every store tick):

```ts
// ❌ Returns a new array each call → consumer re-renders on unrelated state ticks
const visible = useNpxSkillsStore((s) =>
  s.catalogItems.filter((item) => !item.project_only),
);
```

**Good** — store the derived array as a state field and update it inside the
action(s) that modify its inputs:

```ts
// In store:
setCatalogSearch: (value) =>
  set((state) => ({
    catalogSearch: value,
    ...recomputeCatalogDerived({ ...state, catalogSearch: value }),
  })),

// In component:
const visible = useNpxSkillsStore((s) => s.visibleCatalogItems);
```

## Rule 2 — Actions should short-circuit when the value is unchanged

Zustand's `set` always replaces the state object, so every call triggers a
notification even when the value didn't actually change. Short-circuit inside
the action to avoid cascading re-renders:

```ts
setActiveCatalogAnchorId: (value) =>
  set((state) =>
    state.activeCatalogAnchorId === value
      ? state
      : { activeCatalogAnchorId: value },
  ),
```

## Rule 3 — No `filter` / `map` / `sort` directly in a selector

These are the most common culprits because they always create a new container.
If the derivation is non-trivial, put it in a store field via an action; if it
must live in a component, memoize with `useMemo`.

## Rule 4 — Custom selector functions exported for tests stay pure

For tests (see `npxSkillsStore.test.ts`) we keep the pure selector functions
(`selectCatalogSections`, `selectVisibleCatalogItems`) that compute on the fly
from a snapshot state. **Components must not use them** — they must read the
pre-computed cached store field instead. Route:

| Usage | Recommended API |
| --- | --- |
| Component subscription | `useNpxSkillsStore((s) => s.catalogSections)` |
| Unit-test assertions | `selectCatalogSections(stateSnapshot)` |

## Review checklist (until we have an automated lint rule)

When reviewing a store or a component that subscribes to a store, ask:

1. Does any selector return a freshly-constructed container?
2. Does an action `set` always, even when the new value equals the current value?
3. Is any `useEffect` depending on a Zustand selector output that's not a
   primitive or a cached field?
4. If yes to any of the above: is the cache field approach (preferred) or
   `useShallow` (with justification) used to keep the reference stable?

## Context / history

The `npxSkillsStore` catalog path originally returned new arrays from
`selectCatalogSections`. Combined with an `IntersectionObserver` inside
`NpxFindView` whose `useEffect` depended on `catalogSections`, this caused an
infinite commit loop:

1. Store tick ⇒ selector rebuilds the sections array
2. Consumer re-renders ⇒ `useEffect` sees new dep ⇒ new Observer
3. Observer's initial intersection callback fires ⇒ `setActiveCatalogAnchorId`
4. Back to step 1

See `../../../../../..//.claude/plans/mellow-sparking-waterfall.md` for full
incident history.
