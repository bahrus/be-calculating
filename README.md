# be-calculating [WIP]

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">
[![NPM version](https://badge.fury.io/js/be-calculating.png)](http://badge.fury.io/js/be-calculating)

Calculate value of the output element from peer input elements.

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

One critique of the example above is that it recalculates and rebinds the value of the sum anytime any form element inside is modified by the user.

That means if the form has 8 more input elements, the sum will be recalculated, and the value passed to output, even when editing the 8 input elements that aren't part of the sum.

be-calculating doesn't suffer from this scalability limitation.

And what if we want to pass the sum to multiple places?  be-calculating can do that as well.

So what *be-calculating* is wanting to do with this example is shown below:

## Example 1a -- The most compact notation [TODO]

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<output for="a b" be-calculating="from onload expression" onload="a+b"></output>
</form>
```

Here, we are "commandeering" the onload built-in attribute (which isn't applicable to the output element anyway).  

Why?

We consider it safe to include free-ranging JavaScript expressions inside such attributes, having confidence that sanitizing algorithms will strip such attributes if not explicitly permitted by parties who should have such a say-so.

If the expression is difficult to encode inside an HTML attribute, use a script element preceding the output element:

## Example 1b -- using the script/nomodule element

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<script nomodule>
        a + b
    </script><output for="a b" be-calculating></output>
</form>
```

Think of what we've accomplished here!  We have now purified the JavaScript's domain to be independent of the UI.  

Code that we can patent and earn Turing Awards with!

Because now, with a little more tender loving care (described below), we can start to see that we can create a reusable function that can be used in multiple contexts -- anywhere we need to add two numbers together. We've been showing inline examples, but the code can be imported via ESM modules, which is discussed below.

This is shorthand for:

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<script nomodule>
        a + b
    </script><output for="a b" be-calculating='{
        "forAttribute": "for",
        "args": ["a", "b"],
        "propertyToSet": "value",
        "searchBy": "id",
        "searchScope":  ["closestOrHost", "form"],
        "scriptRef": "previousElementSibling",
        "recalculateOn": "change",
        "nameOfCalculator": "calculator"
    }'></output>

    
</form>
```



What this means is we aren't limited to adorning the output element.  But if using some element other than output, the developer will need to override the default settings shown above, depending on the particular scenario.

So to specify to act on the input event, we can edit the JSON above, overriding only those values that need to deviate from the default (recalculateOn: change)

If editing JSON inside HTML attributes feels weird, the [json-in-html](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) vs-code extension makes it feel much more natural, even when editing README files.  Because of the declarative, side-effect-free nature of the extension, it can be used with the web version of VSCode as well.

And the [may-it-be](https://github.com/bahrus/may-it-be) package allows us to benefit from TypeScript tooling, and compiles to an HTML file.

be-calculating supports specific syntax for switching to the input element:

## Example 1c [TODO]

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<script nomodule>
        a + b
    </script><output for="a b" be-calculating oninput></output>
</form>
```

## Sharing calculated values

We may want to display the sum in various places.  One way to do this is shown below:

```html
<form itemscope be-sharing='
    Share sum from scope.
'>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<script nomodule>
        a + b
    </script><output name=sum for="a b" be-calculating='
        {"notify": "scope"}
    '></output>
        
    <data itemprop=sum aria-live=polite></data>

    
</form>
```

[TODO]  Bring back transform option?  

## External Module Renaming

If we want to share our calculating code with the world, we might package it as an npm package.  Note that the code is library neutral, so doesn't need to be accompanied by 17 black-hole-o-grams of dependencies, and a cottage industry of boot camps to master.  Just saying.

But as things stand, we will need to specify the name of the calculator thusly:

### Example 3

```JavaScript
//file calculator.js
export const calculator = ({a, b}) => ({
    value: a + b
});
```

```html
    <form itemscope be-sharing='
      Share sum from scope.
    '>
        <input type="range" id="a" value="23">
        +<input type="number" id="b" value="252334">
        =<script nomodule src="./calculator.js"></script><output name="sum" for="a b" be-calculating='
            {"notify": "scope"}
        '></output>

        <data itemprop=sum></data>
    </form>
```

If we wish to give it a different name, *be-calculating* needs to know about that:

### Example 4

```JavaScript
//file TuringAwardDeservingAlgorithm.js
export const TuringAwardDeservingAlgorithm = ({a, b}) => ({
    value: a + b
});
```

```html
<form itemscope be-sharing='
    Share sum from scope.
'>
    <input type="range" id="a" value="23">
    +<input type="number" id="b" value="252334">
    =<script nomodule src="./TuringAwardDeservingAlgorithm.js"></script><output name="sum" for="a b" be-calculating='{
        "notify": "scope",
        "nameOfCalculator": "TuringAwardDeservingAlgorithm"
        
    }'></output>

    <data itemprop=sum></data>
</form>
```

## [Demo](https://codepen.io/bahrus/pen/NWMjxYV)

Obscure note (ignore if it not understanding the context):  This behavior probably doesn't make sense to be used where it makes sense to use the [trans-render](https://github.com/bahrus/trans-render?tab=readme-ov-file#part-10----trans-render-the-web-component) web component.  For that reason, not separating the be-hive registration from the be-computed class.

## Viewing Locally

Any web server that serves static files will do but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo in a modern browser.

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

