---
name: readable-naming
description: >
  Name variables, functions, types, composables, repositories, and components in
  this Nuxt build so they read like a human wrote them — clear, natural, easy to
  support and refactor. Enforces THIS repo's case conventions (camelCase for
  variables/functions, PascalCase for types/components WITHOUT I/T prefixes,
  UPPER_SNAKE_CASE for true module constants) plus the `Dto`/`Result` type
  suffixes, `use*` composable / `use*Repository` / `App*` component patterns, and
  a set of readability rules. Invoke when naming or renaming identifiers, reviewing
  a diff for naming quality, or when the user asks for "good names", "readable
  variables", "natural names", "зрозумілі назви", or help refactoring confusing
  names.
---

# Readable Naming (nuxt-build)

Produce identifier names a maintainer can read out loud and understand without
chasing the definition. Good names are the cheapest documentation there is — intent
lives in the name, not in a comment that drifts. This skill encodes the case
conventions actually used in this repository (verified against `app/`) and the
readability rules that make names feel natural.

## When to use

- Naming new variables, functions, composables, repositories, stores, types, or components.
- Renaming during a refactor to make intent clearer.
- Reviewing a diff and flagging cryptic, abbreviated, or misleading names.
- The user asks for "readable", "natural", "human", or "зрозумілі/читабельні" names.

## Case conventions (this codebase)

Match the existing style. These are taken from real code in `app/` and `app/core/`.

| Kind | Case | Example (real) |
|------|------|----------------|
| Variables, function/method names, composable returns | `camelCase` | `queryClient`, `validationErrors`, `hasError` |
| Composables (Nuxt `use*`) | `camelCase`, `use` prefix | `useApi`, `useForm`, `useApiError`, `usePageCode` |
| Resource repositories | `use<Domain>Repository` | `useNewsRepository`, `useBookmarksRepository` |
| Pinia stores (when added) | `use<Name>Store` | `useAuthStore` |
| Vue components & files | `PascalCase` | `AppBreadcrumbs`, `CodeCopy` |
| App-wide shared components | `App` prefix | `AppBreadcrumbs` |
| Types & interfaces | `PascalCase`, **no `I`/`T` prefix** | `ApiError`, `Paginated`, `ValidationRule`, `CoreConfig` |
| API request/response payload types | `PascalCase` + `Dto` / `Result` | `LoginDto`, `PostDto`, `LoginResult` |
| Domain model types | `PascalCase`, plain noun | `Post`, `Article` |
| True constants (module-level, immutable) | `UPPER_SNAKE_CASE` | `MESSAGES` |
| Runtime config objects | `camelCase` | `coreConfig` |
| Numeric literals | `_` group separators | `60_000`, `5 * 60_000` |
| Booleans | `camelCase`, predicate prefix | `isError`, `hasError`, `canSubmit`, `isValid`, `shouldRetry` |
| Event handlers | `camelCase`, `on`/`handle` prefix | `onSubmitClick`, `handleError` |

Hard rules that differ from generic guides — do not get these wrong:

- **No `I`/`T` prefixes on types.** This repo uses `ApiError`, not `IApiError`;
  `ValidationRule`, not `TValidationRule`. Adding a prefix is a mistake here.
- **Types/components are PascalCase; plain variables are never PascalCase.**
- **`Dto` suffix means a transport shape** (what crosses the API boundary).
  Domain models drop it (`Post`, `Article`). Don't call a domain model `PostDto`.

## Repository method convention

Repositories in `app/repositories/` follow a fixed method-naming split — reuse it:

- `*Query()` → returns cached `queryOptions` (TanStack), e.g. `listQuery`, `byIdQuery`.
- plain verbs (`getAll`, `create`, `update`, `remove`) → raw/one-off calls via `useApi`.

```ts
export function useNewsRepository() {
  const getAll = () => useApi<Article[]>('/news')
  return {
    getAll,                                                    // one-off read
    listQuery: () => queryOptions({ queryKey: ['news'], queryFn: getAll }), // cached
  }
}
```

## Readability rules

1. **Name the meaning, not the type or mechanism.** `participants`, not `arr` or
   `dataList`. `gradeByQuestionId`, not `map`. The reader learns *what it holds*,
   not *what container it is*.
2. **Pronounceable, whole words.** `selectedPost`, not `selP` or `sp`. A name you
   can say in standup is a name you can grep and refactor.
3. **No cryptic abbreviations.** Avoid `qc`, `cfg`, `usr`, `btn`, `idx`, `tmp`,
   `res`, `msgs`, `e2`. Allowed because universal in this stack: `id`, `ref`,
   `props`, `emit`, `opts`, `i`/`j` for tight loop counters, `el` for a DOM
   element, `db`, `url`, `t` for the i18n translate fn, `v` for a single-line
   validation-rule argument, and `vars`/`ctx`/`data` inside TanStack callbacks.
4. **Read like a phrase.** A boolean reads as a yes/no question (`isOnlineExam`),
   a function reads as a verb phrase (`fetchRubrics`, `normalizeApiError`), a
   collection reads as a plural noun (`bookmarks`, `validationErrors`).
5. **Length matches scope.** A 2-line loop body can use `i`; a value living across
   a 200-line component earns a full descriptive name. Wider scope → more words.
6. **Reuse the codebase's vocabulary.** One concept = one word everywhere. Domain
   words already in the repo: `news`/`article`, `post`, `bookmark`, `login`/`auth`,
   `page`, `code`/`tab`. Infra words: `api`, `http`, `query`, `mutation`,
   `transport`, `repository`, `rule`, `form`, `field`, `token`, `error`. Don't coin
   `feed` for `news` or `record` for `post`.
7. **Say the unit / shape when it prevents bugs.** `timeoutMs`, `staleTime`,
   `widthPx`, `startDate` vs `startTimestamp`. Plural for collections; `byId`/`byKey`
   suffix for lookup maps (`postsById`); `Dto` suffix for transport payloads.
8. **Cut noise words and redundant context.** Drop `data`, `info`, `object`,
   `value`, `manager`, `the` when they add nothing: `userData` → `user`,
   `examInfo` → `exam`. Inside `useNewsRepository`, prefer `getAll` over
   `getAllNews` — the repo already says "news".
9. **Prefer positive booleans.** `isEnabled` over `isNotDisabled`; read the
   condition without mentally inverting it.
10. **Never let a name lie.** Don't call something `list` if it's a `Set`, or
    `selectedIds` if it holds objects. If meaning changes during a refactor,
    rename it in the same change.

## Naturalness test

Before committing a name, read the usage line aloud as a sentence:

- `if (hasUnsavedChanges) showConfirmDialog()` → reads like English. 
- `if (flag2) doIt()` → fails. Rename.
- `const postsById = new Map()` → the reader knows keys and values. 

If you can't say what a name holds without looking at its initializer, it isn't done.

## Procedure

1. Identify the kind of identifier (variable / function / type / payload type /
   composable / repository / component / const) and pick the case from the table.
2. Choose the **domain word** already used in the repo for that concept; grep if
   unsure (`grep -rn "bookmark" app`).
3. Build the name as a phrase: predicate prefix for booleans, verb for functions,
   plural noun for collections, `Dto`/`Result` suffix for transport types, add
   unit/shape suffix if it prevents a bug.
4. Trim noise words and redundant context; keep it as short as clarity allows.
5. Run the naturalness test — read the usage line aloud.
6. When renaming an existing symbol, prefer an editor/LSP rename so every reference
   updates; never rename an exported name without checking call sites
   (`grep -rn "\boldName\b" app`). Update all references in the same change.

## Quick before → after (grounded in this repo)

```
qc                → queryClient
msgs              → messages
res               → result
list              → validationErrors
ok                → isValid
fn                → notify
arr               → bookmarks
getData()         → fetchRubrics()  /  getAll()
tmpUsr            → currentUser
cfg               → coreConfig
IApiError         → ApiError          (no I prefix here)
PostPayload       → PostDto           (transport payload → Dto suffix)
newsList2         → unrecognizedArticles
```

## Rules

- Never violate the case table — variables camelCase, types/components PascalCase,
  true constants UPPER_SNAKE_CASE, no `I`/`T` type prefixes.
- Use `Dto`/`Result` suffixes for transport types; keep domain models plain.
- Follow the repository `*Query()` vs plain-verb method split.
- Prefer clarity over brevity, but cut every word that doesn't add meaning.
- Reuse existing domain vocabulary; don't coin synonyms for known concepts.
- When you rename, update all references in the same change.
- If a name needs a comment to explain what it holds, the name is wrong — fix the
  name first.
