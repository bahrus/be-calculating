# Example 4b — Element Pass-Through Proposal

## Use Case

Sometimes the developer doesn't want be-calculating to infer values from remote elements. Instead, they want the **elements themselves** passed into the event handler, so they can extract whatever they need manually.

This is an escape hatch for situations where:
- The inferred value property isn't what's needed
- Multiple properties from the same element are required
- The developer wants to call methods on the element
- Complex logic that depends on element state beyond a single property

## Previous Syntax (DSS-based, being removed)

```html
<output id=output 🧮-for="#a?.$0 and #b?.$0"></output>
<script>
    output.addEventListener('🧮', e => e.r = e.f.a.valueAsNumber + e.f.b.valueAsNumber);
</script>
```

The `?.$0` suffix meant "pass the element itself rather than its inferred value."

## Proposed New Syntax

### Option A: `$` suffix on the ID

Use a `$` suffix to indicate "pass the element, not its value":

```html
<output id=output for="a$ b$" 🧮></output>
<script>
    output.addEventListener('🧮', e => e.r = e.f.a.valueAsNumber + e.f.b.valueAsNumber);
</script>
```

**Pros:** Concise, works with native `for` attribute, no DSS dependency.  
**Cons:** Slightly magical; `$` has no established meaning in HTML.

### Option B: Separate attribute for element pass-through

Use a dedicated attribute like `🧮-raw` or `🧮-el` to indicate all references should pass elements:

```html
<output id=output for="a b" 🧮 🧮-raw></output>
<script>
    output.addEventListener('🧮', e => e.r = e.f.a.valueAsNumber + e.f.b.valueAsNumber);
</script>
```

**Pros:** Clear intent, no per-ID syntax needed since it's typically all-or-nothing.  
**Cons:** Extra attribute; can't mix element-pass and value-pass for different sources.

### Option C: Attribute value controls pass-through mode

Use the `🧮-for` value with a simple marker. Since `🧮-for` already supports `#` optionally, we could use bare IDs for value-inferred and `$id` for element pass-through:

```html
<output id=output 🧮-for="$a $b"></output>
<script>
    output.addEventListener('🧮', e => e.r = e.f.a.valueAsNumber + e.f.b.valueAsNumber);
</script>
```

**Pros:** Per-reference control, contained within existing attribute.  
**Cons:** Another sigil to remember.

## Recommendation

**Option B** (`🧮-raw`) seems cleanest because:
1. The use case description literally says "pass in the elements" — it's an all-or-nothing decision
2. No new per-ID syntax to parse
3. Works with both `for` (output elements) and `🧮-for` (non-output elements)
4. Clear, self-documenting attribute name

If per-reference granularity is ever needed, Option C could be added later without breaking Option B.

## Implementation Notes

When `🧮-raw` is present:
- `seek` still resolves elements by ID the same way
- Instead of creating `Infer` objects and reading `valueProperty`, store the elements directly in `propToInfer` (or a parallel `propToElement` map)
- In `handleEvent`, pass the element references as-is into `obj` and `args`
- The propagator/event subscription still needs to happen — listen for the `defaultEventType` on each element directly (since we're not inferring anything)
