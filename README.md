# be-calculating

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">

<a href="https://nodei.co/npm/be-calculating/"><img src="https://nodei.co/npm/be-calculating.png"></a>

be-calculating is an element decorator / behavior equivalent of [aggregator-fn](https://github.com/bahrus/aggregator-fn).

be-calculating can't help but admire the brevity and magic on [display here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output):

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x" for="a b"></output>
</form>
```


It is unclear how to leverage that magic outside the confines of this example (how does the context of the names get passed so elegantly into the expression)?

Nevertheless, be-calculating tries to approach the brevity, but also provide more flexible options:

The most exact analog to what the code above is doing, but with the help of be-calculating, is shown below:

## Example 0

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
</form>
<script nomodule be-calculating='{
    "args": {
        "form": {
            "observe": "form",
            "on": "input",
            "vft": "."
        }
    },
    "transform": {
        "xN": "sum"
    }
}'>
    ({form}) => ({
        sum: parseInt(form.a.value) + parseInt(form.b.value)
    });
</script>
```

But this isn't really playing to be-calculating's strengths.  Both examples above recalculate and rebind the value of the sum any time any form element inside is modified by the user.

That means if the form has 10 more input elements, the sum will be recalculated, and the value passed to output, even when editing the 8 input elements that aren't part of the sum.

And what if we want to pass the sum to multiple places?  be-calculating can do that as well.

So what be-calculating is wanting to do with this example is shown below:

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

Basically, be-calculating is picking and choosing pieces of the form that is relevant to the sum.

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
        "get": {
            "vft": "valueAsNumber"
        },
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

vft stands for Value From Target.


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