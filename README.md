# be-calculating (🧮) [WIP]

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">
[![NPM version](https://badge.fury.io/js/be-calculating.png)](http://badge.fury.io/js/be-calculating)

# Part I  Enhancing the output element

Calculate value of the output element from peer input elements.

<details>
    <summary>Alternatives</summary>

*be-calculating* is a very specialized alternative to [*be-observant*](https://github.com/bahrus/be-observant), in case you were wondering.  Unlike *be-observing*, *be-calculating* can only adorn the output and meta elements and skips any attempt at avoiding JavaScript expressions.  *be-calculating* allows for much more compact JavaScript expressions, by taking more liberties with what the platform provides.

</details>

*be-calculating* can't help but admire the brevity and sorcery on [display here](https://www.w3schools.com/TAGs/tag_output.asp):

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
     <input type=range id=a name=a value=50>
    +<input type=number id=b name=b value=25>
    =<output name=result for="a b"></output>
</form>
```

It is unclear how to leverage that magic outside the confines of this example. How does the context of the names get passed so elegantly into the expression?

Anyway, be-calculating vows to match, if not exceed, the brevity of the markup above, while also providing more flexible options.

One critique of the example above is that it recalculates and rebinds the value of the sum anytime any form element inside is modified by the user.

That means if the form has 8 more input elements, the sum will be recalculated, and the value passed to output, even when editing the 8 input elements that aren't part of the sum.

be-calculating doesn't suffer from this scalability limitation.

And what if we want to pass the sum to multiple places?  be-calculating can do that as well.

So what *be-calculating* is wanting to do with this example is shown below:

## Example 1a -- Almost the most compact notation

```html
<form>
    <input type=range id=a value=50>
    +<input type=number id=b value=25>
    =<output for="a b" be-calculating oninput="value = $.a + $.b"></output>
</form>
```

Here, we are "commandeering" the oninput built-in attribute (which isn't applicable to the output element anyway).  

Why?

We consider it safe to include free-ranging JavaScript expressions inside such attributes, having confidence that sanitizing algorithms will strip such attributes if not explicitly permitted by parties who should have a say-so in the matter.


Think of what we've accomplished here!  We have now purified the JavaScript's domain to be independent of the UI, if one squints hard enough.  

Code that we can patent and earn Turing Awards with!

Because now, with a little more tender loving care (described below), we can start to see that we can create a reusable class that can be used in multiple contexts -- anywhere we need to add two numbers together. We've been showing inline examples, but the code can be imported via ES classes located in ESM modules, which is discussed below. 

We can move the script out of the oninput attribute and into a previous script element:

## Example 1b [TODO]

```html
<form>
    <input type=range id=a value=50>
    +<input type=number id=b value=25>
    <script nomodule>
        export class Calculator {
            handleEvent(e){
                e.target.value = e.factors.a + e.factors.b;
            }
        }
    </script>
    =<output for="a b" be-calculating></output>
</form>
```

*be-calculating* supports specific syntax for switching to the change event, rather than the input event:

## Example 1c [TODO]

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<output for="a b" be-calculating onchange="value = $.a + $.b"></output>
</form>
```

## Walk like an Egyptian

Since *be-calculating* seems like a highly useful enhancement that would appear multiple times in a template / html stream, it seems desirable to support an alternative, shorter name, perhaps for less formal settings, where clashes between libraries can be contained.  For example, this package supports the following alternative (by referencing 🧮.js).

## Example 1d The most compact notation [TODO]

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<output for="a b" 🧮 oninput="value=$a + $b"></output>
</form>
```

If you prefer some other emoji or (shorter? name), look to [this file](https://github.com/bahrus/be-calculating/blob/baseline/%F0%9F%A7%AE.js) to see how easy it is to take ownership of your own name.

So everywhere you see 🧮 below, please map this hieroglyph in your mind to the expression "be calculating".

## Alternative element references and/or event names

Anything that requires subscribing to alternative or mixed event names, and/or that requires referencing nearby elements using something other than id's, needs to use an alternative to the *for* attribute, and use neither the oninput nor the onchange event.  We do so by adopting [DSS](https://github.com/bahrus/trans-render/wiki/VIII.--Directed-Scoped-Specifiers-(DSS)) to describe what to observe, and the more neutral "onload" event.

## Example 1e [TODO]

```html
<form>
    <input type="range" name=a value="50">
    +<input type="number" name=b value="25">
    =<output 🧮="@a @b" onload="value = $a + $b"></output>
</form>
```

This still happens to assume, by default, that the "input" event is what we should listen for, but having adopted DSS syntax, we can specify any other event name we may want.   While "onload" isn't the most semantic name, perhaps, think "onload of (changes) to these elements, do this...".  Id's and the *for* attribute are generated automatically by *be-calculating* in order to optimize our accessibility experience.

# Part II Applied to non output elements

This enhancement also supports other elements.  The script will need to be a bit more verbose though:

## Example 2a - Brave syntax [TODO]

If no other enhancements are overloading the onload event, script away bravely

```html
<input name=domain value=emojipedia.org>
<input name=search value=calculator>
<a 
    🧮="@domain @search" 
    onload="href = `https://${event.factors.domain}/search?q=${event.factors.search}`">
    Emoji link
</a>
```

## Example 2b - Defensive syntax [TODO]

To code defensively, check for the enh property of the event:

```html
<input name=domain value=emojipedia.org>
<input name=search value=calculator>
<a 
    🧮="@domain @search" 
    onload="
    const {enh, factors: f} = event;
    if(enh !== 🧮) return;
    href = `https://${f.domain}/search?q=${f.search}`">
    Emoji link
</a>
```

# Part III Sharing the output element, and other binding examples [WIP]

Trigger alert:  Allow for a little head spinning below.  It takes a little getting used to.

The output element can also get in on the sharing act.



```html
<form>
    <span itemprop=sum 🧮=@c oninput="textContent = for.c.value"></span>
    <input type="range" id="a" value="50">
    +<input type="number" id="b" value="25">
    =<output name=c for="a b" 🧮 oninput="value=for.a + for.b"></output>
</form>
```

# Part IV External Module Renaming

If we want to share our calculating code with the world, we might package it as an npm package.  Note that the code is library neutral, so doesn't need to be accompanied by 17 black-hole-o-grams of dependencies, and a cottage industry of boot camps to master.  Just saying.

But as things stand, we will need to specify the name of the calculator thusly:

## Example 4a

```JavaScript
//file calculator.js
export class Calculator {
    handleEvent(e){
        e.target.value = e.factors.a + e.actors.b;
    }
}
```

```html
<input type="range" id="a" value="23">
+<input type="number" id="b" value="252334">
=<script nomodule src="./calculator.js"></script>
<output for="a b" 🧮></output>
```

If we wish to give it a different name, *be-calculating* needs to know about that:

## Example 4b [TODO]

```JavaScript
//file TuringAwardDeservingAlgorithm.js
export class TuringAwardDeservingAlgorithm {
    handleEvent(e){
        e.target.value = e.for.a + e.for.b;
    }
}
```

```html
<input type="range" id="a" value="23">
+<input type="number" id="b" value="252334">
=<script nomodule src="./TuringAwardDeservingAlgorithm.js"></script>
<output for="a b" 🧮-name-of-calculator=TuringAwardDeservingAlgorithm></output>
```

## [Demo](https://codepen.io/bahrus/pen/NWMjxYV)



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

