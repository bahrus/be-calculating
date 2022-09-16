# be-calculating [TODO]

be-calculating provides a more complete(?) solution to what the [output element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output) provides

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x" for="a b"></output>
</form>
```

The equivalent with be-calculating:

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x" for="a b"></output>
    <script nomodule be-calculating>parseInt(a.value) + parseInt(b.value)</script>
</form>
```

This is short hand for:

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<script nomodule be-calculating='{
        "observeClosest": "*",
        "argList": "elements",
        "argName": "name",
        "filter": ["a", "b"],
        "argValue": "value",
        "on": "input",

    }'>parseInt(a.value) + parseInt(b.value)</script>
    <output name="x" for="a b">
        
    </output>
</form>
```