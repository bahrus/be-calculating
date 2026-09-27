# Add Support For Programmatic Attachment

## Bruce's Ask

Can you please follow the example of [be-persistent](https://github.com/bahrus/be-persistent) and [be-bound](../../be-bound) and [the addendum](../types/ImportantEnhancementAddendum.md) to add demos and adjust be-calculating.js as needed and add def.js to support programmatic attachment of this enhancement?

Please add your implementation notes below.

## Implementation Notes

I followed the addendum's checklist, with be-persistent and be-bound as
models. Unlike be-bound, be-calculating needed no new "programmatic-friendly"
property: every attribute already maps to a plain property (`forAttr`,
`handler`, `eventArg`, `js`, `format`, `raw`). Several places assumed the
attribute path, though, and needed fixing.

### Addendum steps

1. **`init()` awaits `roundabout(...)` and then sets `self.initialized = true`.**
2. **`ctx.emc || ctx.config`**, for `customData` and also for `enhKey`. `enhKey`
   was read only from `ctx.emc.enhConfig`, so it fell back to
   `'be-calculating'`. It now uses `ctx.config.enhKey`, which is
   `'beCalculating'` for the `emc.json` that `def.js` registers.
3. **`def.js`** exports `defBeCalculating(ref)`, using the same formula as
   `defBePersistent` / `defBeBound`. `package.json`:
   - `exports` now includes `./def.js`, `./emc.json`, `./🧮.json` and
     `./CalcRegistry.js`. be-calculating.js imports itself as
     `be-calculating/CalcRegistry.js`, so that entry is needed for real
     consumers.
   - I removed `./emc.js`, which doesn't exist.
   - `files` now includes `*.json`. Before, neither `emc.json` nor `🧮.json`
     was published, even though the README's be-hive usage points at
     `be-calculating/🧮.json`.
4. **Reserved names.** None of the properties collide with `nudge`, `rock`,
   `awake` or `covertAssignment`. There was an unmonitored-property problem,
   though. `eventArg` has a default in `defaultPropVals`, but no action
   condition referenced it, so an imperatively set `eventArg` was overwritten
   by `'input'`. I added it to `getDefltEvtType`'s `ifAllOf`. It always has a
   value, so this changes nothing for the attribute path.
5. **Tests.** See below.

### Timing fix: handler set before roundabout finishes

The first test run showed that `handler` set imperatively (via `enh.get()`,
or via `enh.set` *after* `defBeCalculating`) never took effect. The value
survived, but `getEvtHandler` only fires when `handler` *changes*, and the
change happened before roundabout was monitoring it. A related race was
already there: `categorizeEl` set `checkedRegistry: true` whenever `handler`
was still empty at that moment, which let `hydrate` do its initial
calculation with no handler.

Fix:

- `getEvtHandler` now uses `ifKeyIn: ['initialized', 'handler'], ifAllOf: ['initialized']`.
  So it always runs once when initialization completes, and again whenever
  `handler` changes.
- `getEvtHandler` is now the only action that sets `checkedRegistry` (removed
  from `categorizeEl`). Because `hydrate` requires `checkedRegistry`, it can
  no longer run before the handler is resolved.
- `parseJS` also requires `initialized`, for the same reason with `js`.
- `hydrate` requires `initialized`, per the addendum.

### Programmatic ergonomics

- **`handler` may be a function.** `getEvtHandler` uses it directly as
  `handlerObj`. This matters because the event dispatched on the element is
  named after `enhKey`: `beCalculating` when attached programmatically,
  versus `🧮` / `be-calculating` via attributes. A listener-based handler
  would need to know that name.
- **`forAttr` may be an array** of IDs, not just a space-separated string. A
  shared `toIds()` helper handles both forms, with or without `#`.
- **`<output>` without a `for` attribute.** `parseForAttr` used to read
  `enhancedElement.htmlFor` and ignore `forAttr`, so a programmatically set
  `forAttr` did nothing on an `<output>`. It now parses `forAttr`, which
  `init` still seeds from the native `for` attribute.
- **`raw: false`** is no longer treated as raw. It used to check
  `raw !== undefined`.

### Demos and tests

- `demo/Programmatic/DeclarativeInSequence.html`: `<output>` with no `for`,
  `forAttr = ['a','b']` via `.set`, `handler = '+'`.
- `demo/Programmatic/DeclarativeOutOfSequence.html`: the same with `*`,
  properties set before `defBeCalculating`.
- `demo/Programmatic/Imperative.html`: Example 4a (the link) via `enh.get()`,
  with a handler function.
- `demo/Programmatic/ImperativeEventArg.html`: `eventArg: 'change'` set
  imperatively. The test checks that an `input` event does *not*
  recalculate but `change` does. This exercises the monitoring fix above.
- `tests/Programmatic/*.html` + `*.spec.mjs` mirror the four demos.

All 5 Playwright tests pass (the existing Example1a plus the 4 new ones).
Example1a is the only attribute demo with a test, so I also loaded all ten
`demo/Example*.html` pages in Playwright and confirmed each still computes
the expected value.

### Other changes

- `types/be-calculating/types.d.ts` (in the `types` git submodule): `handler`
  is now `string | function`, `raw` is `boolean | string`, and `forAttr`
  (moved to `EndUserProps`) is `string | string[]`. Added `initialized`.
  **These edits need to be committed and pushed in the `types` submodule
  separately.**
- `emc.json` / `🧮.json` were regenerated with `npm run build`.
- The README has a new "Part V Programmatic attachment" section.

