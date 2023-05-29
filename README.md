# be-calculating [WIP]

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">
[![NPM version](https://badge.fury.io/js/be-calculating.png)](http://badge.fury.io/js/be-calculating)


*be-calculating* is a custom enhancement equivalent of web component [aggregator-fn](https://github.com/bahrus/aggregator-fn).

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

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<script nomodule>
        a + b
    </script><output for="a b" be-calculating></output>
</form>
```

This is shorthand for:

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =    <script nomodule>
        a + b
    </script><output for="a b" be-calculating='{
        "forAttribute": "for",
        "propertyToSet": "value",
        "searchBy": "id",
        "searchScope":  ["closestOrRootNode", "form"],
        "scriptRef": "previousElementSibling",
        "reCalculateOn": "change",
        "nameOfCalculator": "calculator"
    }'></output>

    
</form>
```

These default settings will be discussed in more detail below [TODO].

## Sharing calculated values [TODO]

We may want to display the sum in various places.

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
        
    <data itemprop=sum></data>

    
</form>
```

