# be-calculating [TODO]

be-calculating is an element decorator / behavior equivalent of [aggregator-fn](https://github.com/bahrus/aggregator-fn).

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
    =<output name="x"></output>
    <script nomodule be-calculating='["a", "b"]'>
        ({a, b}) => ({
            xN: {value: parseInt(a.value) + parseInt(b.value)}
        })
    </script>
</form>
```

This is shorthand for:

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
    <script type=module nomodule be-calculating='{
        "args":{
            "a": {
                "observeName": "a",
                "on": "input",
                "vft": ".",
            },
            "b": {
                "observeName": "b",
                "on": "input",
                "vft": ".",
            }
        },
        "transformParent": true
    }'>        
        export const transformGenerator = ({a, b}) => ({
            "[name='x']: {value: parseInt(a.value) + parseInt(b.value)}
        });
    </script>
</form>
```