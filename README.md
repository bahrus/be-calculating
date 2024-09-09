# be-calculating (🧮) [TODO]

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">
[![NPM version](https://badge.fury.io/js/be-calculating.png)](http://badge.fury.io/js/be-calculating)

*be-calculating* is basically the code-first counterpoint to the declarative [*be-observant*](https://github.com/bahrus/be-observant) enhancement, when the full power of the JavaScript run time engine is needed.

# Part I  Enhancing the output element

Calculate value of the output element from peer input elements.

## Example 1a Global Registry, class based [TODO]

```html
<script type=module>
    import {Registry} from 'be-hive/Registry.js';
    import {emc} from 'be-calculating/🧮.js';
    //option 1
    Registry.register(emc, '+', class {
        handleEvent(e){
            e.target.value = e.args.reduce((acc, arg) => acc + arg)
        }
    });


</script>
<form>
     <input type=range id=a name=a value=50>
    +<input type=number id=b name=b value=25>
    =

    <output name=result for="a b" 🧮=+></output>
</form>
```

## Example 1b Global registry, function based [TODO]

```html
<script type=module>
    import {Registry} from 'beHive/Registry.js';
    import {emc} from 'be-calculating/🧮.js';
    //option 2
    Registry.register(emc, '+', e => e.target.value = e.args.reduce((acc, arg) => acc + arg));
</script>

<form>
     <input type=range id=a name=a value=50>
    +<input type=number id=b name=b value=25>
    =

    <output name=result for="a b" 🧮=+></output>
</form>
```

In order to define a handler or multiple handlers, limited to your current ShadowDOM Realm (and inheriting ShadowDOM Realms), you will need to define a unique (to any parent Shadow Roots, within the context of this enhancement) "handlerKey" in the 'be-hive" instance that you plop within your shadow realm:

## Example 1c Locally scoped handler

```html
<be-hive id=my-scoped-be-hive>
    <script type=mountobserver id=be-hive.🧮 onload="
        //if the browser engineers can't figure out how to secure this, we are truly lost.
        const emc = synConfig;
        Registry.register(emc, '+', e => e.target.value = e.args.reduce((acc, arg) => acc + arg));
    ">
        {
            "handlerKey": "myScopedHandlers"
        }
    </script>
</be-hive>

```


Anyway...

Think of what we've accomplished here!  We have now purified the JavaScript's domain to be independent of the UI, if one squints hard enough.  

Code that we can patent and earn Turing Awards with!  We can create a reusable class  that can be used in multiple contexts -- anywhere we need to add multiple numbers together. We've been showing inline examples, but the code can be imported via ES classes or functions located in ESM modules. 


*be-calculating* supports specific syntax for switching to the change event, rather than the input event, which is the default:

## Example 1d [TODO]

```html
<form>
    <input type="range" id=a value="50">
    +<input type="number" id=b value="25">
    =<output for="a b" 🧮=+ 🧮-on=change></output>
</form>
```

If the 🧮 emoji conflicts with another enhancement in the ShadowDOM root, look to [this file](https://github.com/bahrus/be-calculating/blob/baseline/%F0%9F%A7%AE.js) to see how easy it is to take ownership of your own name.

BTW, the canonical name for this enhancement is the name of this package, *be-calculating* for more formal settings.

## Alternative element references and/or event names

Anything that requires subscribing to alternative or mixed event names, and/or that requires referencing nearby elements using something other than id's, needs to use an alternative to the *for* attribute.  We do so by adopting [DSS](https://github.com/bahrus/trans-render/wiki/VIII.--Directed-Scoped-Specifiers-(DSS)) to describe what to observe, and optionally when to act.

## Example 1e

```html
<form>
    <input type="range" name=a value="50">
    +<input type="number" name=b value="25">
    =<output 🧮-for="@a @b" 🧮=+></output>
</form>
```

This still happens to assume, by default, that the "input" event is what we should listen for, but having adopted DSS syntax, we can specify any other event name we may want.   Id's and the *for* attribute are generated automatically by *be-calculating* in order to optimize our accessibility experience (if the for attribute/htmlFor property is found to null/undefined).

# Part II Applied to non output elements

This enhancement also supports other elements.  The script will need to be a bit more verbose though:

## Example 2a - Brave syntax

If no other enhancements are overloading the onload event, script away bravely

```html
<script type=module></script>
<input name=domain value=emojipedia.org>
<input name=search value=calculator>
<a 
    🧮="@domain @search" 
    onload="href = `https://${event.factors.domain}/search?q=${event.factors.search}`">
    Emoji link
</a>
```

## Example 2b - Defensive syntax

To code defensively, check for the enh property of the event:

```html
<input name=domain value=emojipedia.org>
<input name=search value=calculator>
<a 
    🧮="@domain @search" 
    onload="
    const {enh, factors: f} = event;
    if(enh !== '🧮') return;
    href = `https://${f.domain}/search?q=${f.search}`">
    Emoji link
</a>
```

# Part III Sharing the value of output element, and other binding examples

Trigger alert:  Allow for a little head spinning below.  It takes a little getting used to.

The output element can also get in on the sharing act.

## Example 3a Responding to changes of the output element

```html
<form>
    <span itemprop=sum 🧮=@c onload="textContent = $.c"></span>
    <input type="range" id="a" value="50">
    +<input type="number" id="b" value="25">
    =<output name=c for="a b" 🧮 oninput="value=$.a + $.b"></output>
</form>
```

> ![NOTE]
> In the example above, data is "flowing" both up and down.  In general, I think it is more natural and easier on the end user for data to flow in a downward direction, as most literary languages flow in that direction.  However, if that is not possible, do map out mentally or on (virtual) paper the dependency tree to make sure there aren't any cyclic loops that could result in an infinite loop catastrophe.

## Example 3b - Gain full access to the element

In the examples above, we engaged in "mind reading" in order to pass to the event handler the precise values we want to use in order to calculate the result.

The DSS syntax this package relies on allows us to override these mind readings, and specify which property to pass.  The DSS feature that seems most useful in this context is probably:

> Thanks but no thanks to all your "mind reading" -- could you please just pass in the dependent elements when they change, since I have full, unfettered access to the JavaScript engine, and I would like to extract things out of the elements that I please without your help?

To do so, specify this as follows:

```html
<form>
    <input type="range" id="a" value="50">
    +<input type="number" id="b" value="25">
    =<output 🧮="#a:$0 #b:$0" onload="value=$.a.valueAsNumber + $.b.valueAsNumber"></output>
</form>
```

In particular, DSS now supports :$0 to specify the element itself as the thing that needs passing.



# Part IV External Module Renaming

If we want to share our calculating code with the world, we might package it as an npm package.  Note that the code is library neutral, so doesn't need to be accompanied by 17 black-hole-o-grams of dependencies, and a cottage industry of boot camps to master.  Just saying.

But as things stand, we will need to specify the name of the calculator thusly:

## Example 4a

```JavaScript
//file calculator.js
export class Calculator {
    handleEvent(e){
        e.target.value = e.factors.a + e.factors.b;
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

## Example 4b

```JavaScript
//file TuringAwardDeservingAlgorithm.js
export class TuringAwardDeservingAlgorithm {
    handleEvent(e){
        e.target.value = e.factors.a + e.factors.b;
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

