# be-calculating

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">

<a href="https://nodei.co/npm/be-calculating/"><img src="https://nodei.co/npm/be-calculating.png"></a>

*be-calculating* is an element decorator / behavior equivalent of web component [aggregator-fn](https://github.com/bahrus/aggregator-fn).

*be-calculating* can't help but admire the brevity and sorcery on [display here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output):

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x" for="a b"></output>
</form>
```


It is unclear how to leverage that magic outside the confines of this example. How does the context of the names get passed so elegantly into the expression?

Anyway, be-calculating hopes to at least come close when it comes to brevity, while also providing more flexible options.

The most exact equivalent to what the code above is doing, but with the help of be-calculating, is shown below:

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
    }
}'>
    parseInt(form.a.value) + parseInt(form.b.value)
</script>
```

But this isn't really playing to *be-calculating*'s strengths.  Both examples above recalculate and rebind the value of the sum anytime any form element inside is modified by the user.

That means if the form has 8 more input elements, the sum will be recalculated, and the value passed to output, even when editing the 8 input elements that aren't part of the sum.

And what if we want to pass the sum to multiple places?  be-calculating can do that as well.

So what *be-calculating* is wanting to do with this example is shown below:

## Example 1

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
    <script nomodule be-calculating='["a", "b"]'>
        a + b
    </script>
</form>
```

Basically, *be-calculating* is picking and choosing only those pieces of the form that are relevant to the sum.

Think of what we've accomplished here!  We have now purified the JavaScript's domain to be independent of the UI.  

Code that we can patent and earn Turing Awards with!

Because now, with a little more tender loving care (described below), we can start to see that we can create a reusable function that can be used in multiple contexts -- anywhere we need to add two numbers together. We've been showing inline examples, but the code can be imported via ESM modules, which is discussed below.

The example above is shorthand for:

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
                "valueFromTarget": "valueAsNumber"
            },
            "b": {
                "observeName": "b",
                "on": "input",
                "vft": "valueAsNumber"
            }
        },
        "transformScope": ["upSearch", "*"],
        "transform":{"*": "value"}
    }'>        
        export const calculator = async ({a, b}) => ({
            value: a + b
        });
    </script>
</form>
```



It leverages the robust syntax options provided by [be-observant](https://github.com/bahrus/be-observant), and the transform relies on [declarative trans-rendering (DTR)](https://github.com/bahrus/trans-render).

If editing JSON inside HTML attributes feels weird, the [json-in-html](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) vs-code extension makes it feel much more natural, even when editing README files.  Because of the declarative, side-effect-free nature of the extension, it can be used with the web version of VSCode as well.

And the [may-it-be](https://github.com/bahrus/may-it-be) package allows us to benefit from TypeScript tooling, and compiles to an HTML file.


## Yeah, but can your framework do this?

>Okay, yeah, that's great, but what if I throw a wrench into the works, and add a requirement to show a product as well?

So there are lots of equally good ways to approach this -- separate scripts tags is one way.  But let's see what this looks like sticking to a single script tag.

In this scenario, we need to ask the developer to do something that is always a bit emotionally draining:  Come up with names for that thing you get when you add two numbers together, and that other thing when you multiply two numbers together.  We also need to start providing a little more context, indicating we are using an arrow function:


## Example 3:

```html
<form>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
    <p aria-live=polite itemscope>
        Yes, and did you also know that 
        <span itemprop='augend'></span> 
        * <span itemprop='addend'></span> 
        = <span itemprop='by-product'></span>
    </p>
    <script nomodule be-calculating='{
        "args": ["a", "b"],
        "transform": {
            "xN": "sum",
            "augendI": "a",
            "addendI": "b",
            "byProductI": "product"
        },
        "transformScope": "parent"
    }'>
        ({a, b}) => ({
            sum: a + b,
            product: a*b
        });
    </script>
</form>
```

## External Module Renaming

If we want to share our calculating code with the world, we might package it as an npm package.  Note that the code is library neutral, so doesn't need to be accompanied by 17 black-hole-o-grams of dependencies, and a cottage industry of boot camps to master.  Just saying.

But as things stand, we will need to specify the name of the calculator thusly:

### Example 3

```JavaScript
//file calculator.js
export const calculator = ({a, b}) => ({
    sum: a + b,
    product: a*b
});
```

```html
    <form>
        <input type="range" name="a" value="50">
        +<input type="number" name="b" value="25">
        =<output name="x"></output>
        <p aria-live=polite itemscope>
            Yes, and did you also know that 
                <span itemprop='augend'></span> 
                * <span itemprop='addend'></span> 
            = <span itemprop='by-product'></span>
        </p>
        <script nomodule src='calculator.js' be-calculating='{
            "args": ["a", "b"],
            "get": "valueAsNumber",
            "transform": {
                "xN": "sum",
                "augendI": "a",
                "addendI": "b",
                "byProductI": "product"
            },
            "transformScope": "parent"
        }'></script>
    </form>
```



If we wish to give it a different name, *be-calculating* needs to know about that:

```JavaScript
export const TuringAwardDeservingAlgorithm = ({a, b}) => ({
    sum: a + b,
    product: a*b
});
```

```html
<script nomodule be-calculating='{
    ...
    "nameOfCalculator": "TuringAwardDeservingAlgorithm"
}
```

## Other things

Behind the scenes, the object that appears before the => represents an ES6 proxy that implements the EventTarget (basically).

To directly update the proxy, add "self" to the destructuring.  "self" references the proxy

```JavaScript
export const calculator = ({a, b, self}) => {
    self.sum = a + b;
    self.product = a * b;
};
```

<details>
    <summary>transformScope in detail</summary>

The scope of the transform is configured  via the transformScope setting:

```TypeScript
/**
 * Outer boundary that transform should act on.
 */
export type Scope = 
    /**
    * use native function getRootNode() to set the boundary
    *
    */ 
    'rootNode' | 
    /**
    * abbrev for rootNode
    */ 
    'rn' |
    /**
    * Use the parent element as the boundary
    */ 
    'parent' | 
    /**
    * abbrev for parent
    */
    'p' |
    /**
     * Use the element itself as the boundary
     */ 
    'self' | 
    /**
     * abbrev for self
     */ 
    's' |
    /**
     * Use the native closest function to get the boundary
     */
    ['closest', string] |
    /**
     * abbrev for closet
     */
    ['c', string] | 
    /**
     * Find nearest previous sibling, parent, previous sibling of parent, etc that matches this string.
     */
    ['upSearch', string] |
    /**
     * abbrev for upSearch
     */
    ['us', string] |
    /**
     * second element is true, then tries .closest('itemscope').  If string, tries .closest([string value])
     * If that comes out to null, do .getRootNode
     */
    ['closestOrHost', boolean | string] |
    /**
     * abbrev for closestOrHost
     */
    ['coh', true | string]
;
```

</details>

The default value is upSearch='*'.  It is beneficial from both a performance and a namespace collision avoiding point of view to use the smallest scope possible.


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