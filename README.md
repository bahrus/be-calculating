# be-calculating

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">

<a href="https://nodei.co/npm/be-calculating/"><img src="https://nodei.co/npm/be-calculating.png"></a>

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

## Example 1

```html
    <form>
        <input type="range" name="a" value="50">
        +<input type="number" name="b" value="25">
        =<output name="x"></output>
        <script nomodule be-calculating='["a", "b"]'>
            ({a, b}) => ({
                sum: Number(a) + Number(b)
            });
            export const transform = {
                xN: 'sum'
            }
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
                "vft": "value"
            },
            "b": {
                "observeName": "b",
                "on": "input",
                "vft": "value"
            }
        },
        "transformParent": true
    }'>        
        export const calculator = ({a, b}) => ({
            sum: Number(a) + Number(b)
        });
        export const transform = {
            [name='x']: 'sum'
        }
    </script>
</form>
```

It leverages the robust syntax of [be-observant](https://github.com/bahrus/be-observant) and the transform relies on [declarative trans-rendering (DTR)](https://github.com/bahrus/trans-render).

## Example 2:  More declarative (faster parsing time)

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
    <script nomodule be-calculating='{
        "args": ["a", "b"],
        "transform": {
            "xN": "sum"
        }
    }'>
        ({a, b}) => ({
            sum: Number(a) + Number(b)
        })
    </script>
</form>
```

If editing JSON inside HTML attributes feels weird, the [json-in-html](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) makes it feel much more natural.

And the [may-it-be](https://github.com/bahrus/may-it-be) package allows us to benefit from TypeScript tooling, and compiles to an HTML file.

## Example 3:  Use the platform

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
    <script nomodule be-calculating='{
        "args": ["a", "b"],
        "defaultProp": "valueAsNumber",
        "transform": {
            "xN": "sum"
        }
    }'>
        ({a, b}) => ({
            sum: a + b
        });
    </script>
</form>
```


## [Demo](https://codepen.io/bahrus/pen/NWMjxYV)

## Viewing Locally

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/dev in a modern browser.

## Importing in ES Modules:

```JavaScript
import 'be-calculating/be-calculating.js';

```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-calculating';
</script>
```