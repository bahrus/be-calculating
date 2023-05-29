# be-calculating [TODO]

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">

<a href="https://nodei.co/npm/be-calculating/"><img src="https://nodei.co/npm/be-calculating.png"></a>

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

The most exact equivalent to what the code above is doing, but with the help of be-calculating, is shown below:

## Example 0

```html
<form itemscope>
    <input type="range" name="a" value="50">
    +<input type="number" name="b" value="25">
    =<output name="x"></output>
</form>
<script nomodule be-calculating='
    Observe 
'>
    parseInt(form.a.value) + parseInt(form.b.value)
</script>
```

But this isn't really playing to *be-calculating*'s strengths.  Both examples above recalculate and rebind the value of the sum anytime any form element inside is modified by the user.

That means if the form has 8 more input elements, the sum will be recalculated, and the value passed to output, even when editing the 8 input elements that aren't part of the sum.

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
    =<output for="a b" be-calculating='{
        "forAttribute": "for",
        "propertyToSet": "value",
        "searchBy": "id",
        "scriptRef": "previousElementSibling",
        "scope":  ["closestOrRootNode", "form"],
        "reCalculateOn": "change",
        "nameOfCalculator": "calculator"
    }'></output>
    <script nomodule>
        a + b
    </script>
    
</form>
```

These default settings will be discussed in more detail below [TODO].

## Sharing calculated values

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
        
    <data itemprop=sum><span itemprop=sum></span></data>

    
</form>
```

