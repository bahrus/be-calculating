# be-calculating (🧮) 

[![The Plan](https://www.berfrois.com/uploads/2011/06/rr3.jpg)](https://www.berfrois.com/2011/06/wile-e-coyote-pursues-road-runner/)

[![Playwright Tests](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-calculating/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-calculating?style=for-the-badge)](https://bundlephobia.com/result?p=be-calculating)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-calculating?compression=gzip">
[![NPM version](https://badge.fury.io/js/be-calculating.png)](http://badge.fury.io/js/be-calculating)

*be-calculating* is basically the code-first counterpoint to the declarative [*be-observant*](https://github.com/bahrus/be-observant) enhancement, when the full power of the JavaScript run time engine is needed from the get-go.

# Part I  Enhancing the output element with built in aggregators

Calculate value of the output element from peer input elements.

## Example 1a Summing up

```html
<form>
     <input type=range id=a name=a value=50>
    +<input type=number id=b name=b value=25>
    =

    <output name=result for="a b" be-calculating=+></output>
</form>
```

*be-calculating* is the canonical name for this enhancement.  In less formal settings, where classes between libraries can be avoided and concerns about HTML5 compliant aren't required, we can make use of alternative names.  This package provides support for one:

```html
<form>
     <input type=range id=a name=a value=50>
    +<input type=number id=b name=b value=25>
    =

    <output name=result for="a b" 🧮=+></output>
</form>
```

What this does:  The output element displays the sum of a and b, updated the moment the user changes either one of them.  I.e. it is listening to the input events for a and b (and no other elements).

Other "built in" calculators are shown below:

| Operator |  Notes                |
|----------|-----------------------|
| +        | Sums the args         |
| *        | Product of the args   |
| max      | Maximum of the args   |
| min      | Minimum of the args   | 

## Example 1b Multiplying

```html
<form>
     <input type=range id=a name=a value=50>
    *<input type=number id=b name=b value=25>
    =

    <output name=result for="a b" 🧮=*></output>
</form>
```

## Example 1c Maximizing 

```html
<form>
    max( <input type=range id=a name=a value=50>
    ,<input type=number id=b name=b value=25>)
    =

    <output name=result for="a b" 🧮=max></output>
</form>
```

# Part II Custom calculations

Unfortunately, the platform has proven to be quite unfriendly to HTML-first solutions (due to "framework capture" politics, where browser vendors seem much more interested in shmoozing with framework authors than serving end user needs).  I would have preferred supporting inline event handlers (which a previous incarnation supported), but this is not able to survive "minimal" security settings scrutiny.  A makeshift [userland solution](https://github.com/bahrus/be-hashing-out) could have solved this, but the main benefit of inline event handlers is to allow the browser to parse the handlers, which that solution doesn't solve. So the solutions below (global, local) seem to be the best solution given these headwinds. 

## Example 2a Global registry, function based

The developer can create a custom calculating function, as shown below.  Doing so will cascade through the page into any ShadowDOM realms.  The advantages is it makes it highly reusable.  The thing to be cautious about is that it is "global" within the confines of all the elements adorned by the 🧮 attribute.

```html
<script type=module blocking=render>
    (await (import'be-calculating/🧮.js'))
        .register('linear', e => e.r = e.f.m * e.f.x + e.f.b)
    ;
</script>

<form>
    <label>
        m
        <input type=number id=m value=2>
    </label>
    <label>
        x
        <input type=number id=x value=2>
    </label>
        
    + <label>
        b
        <input type=number id=b value=25>
    </label>
    =

    <output name=result for="m x b" 🧮=linear></output>
</form>
```

In the javascript expression at the top, "f" stands for "factors", "r" for "result" or "return".

So the event provides the "f" property, which is basically the factors we want the calculation based on -- the names (id's in this case) of the values.

But in some cases, we just want the array of arguments.  In fact, the examples in part I were using reducers based on the args property of the event.  So built in to 🧮 are registered event handlers such as

```JavaScript
Registry.register(emc, '+', e => e.r = e.args.reduce((acc, arg) => acc + arg));
```

## Example 2b  Traditional local event handler

A framework or custom element host or local script element can attach a local event listener to the output element and compute the value

```html
<form>
    <label>
        m
        <input type=number id=m value=2>
    </label>
    <label>
        x
        <input type=number id=x value=2>
    </label>
        
    + <label>
        b
        <input type=number id=b value=25>
    </label>
    =

    <output id=output name=result for="m x b" 🧮></output>
    <script>
        output.addEventListener('🧮', e => e.r = e.f.m * e.f.x + e.f.b);
    </script>
</form>

```

The example above, while simple has a number of issues:

1.  Inside a shadowRoot, elements with id's like "output" don't become global constants, so we need to perform queries within the shadow root for the element.  But how do we get the shadowRoot in our script tag?
2.  It requires defining an id.  If such an id is needed anyway, no harm done.  If not, that's kind of a pain
3.  There is likely a subtle timing concern that might bite once every 1000 tries.
3.  If this is part of a repeating web component, the script tag would need to parsed for each instance

So to do the example above in a  way that addresses these concerns, we can go in one of two ways, each with their advantages and disadvantages:

## CSP Safe Peer script element with self-awareness enhancement [TODO]


```html
<form>
    <label>
        m
        <input type=number id=m value=2>
    </label>
    <label>
        x
        <input type=number id=x value=2>
    </label>
        
    + <label>
        b
        <input type=number id=b value=25>
    </label>
    =

    <output name=result for="m x b" 🧮-js="f.m * f.x + f.b"></output>
    
</form>
```


By "CSP Safe," I mean that with minimal standard protections in place, the browser will provide a blocking error when it doesn't find a matching csp hash value, and provide what that hash value needs to be, so that with enough patience, or with a good build engine, http headers or a meta tag such as what we see below can put the browser at ease:

```html
    <meta http-equiv="Content-Security-Policy" 
    content="
        default-src 'self'; style-src 'self'; img-src 'self'; 
        script-src 
            'sha256-NdPEJFVQRHzDnDETRYKcvXUeTTDl5bEC5BpjzeA22yE=' 
            'sha256-i6TvqP2TVtG9MVoQx7msqKMo9N5gKfwHr7cZVV6d4xg='
            'sha256-kYCKyd++EI0QB9YUHtFWecp5JC9aEMAJXKYs627N97A='
            'sha256-WKHAJV10n+uRXN4tBgzWP2+xzIHx17UDLYsfih7sDCI='
            'sha256-NwD1Uj3szNXySAwCTzxmKecgUosm4JX/FH81ae1I92o='
            'sha256-/0HNY8ZMkctGwbm9m0+ixgmu4QFFJXOLg92huDNwWks='
        ;
    ">
```

Each calculated expression should only result in one hash code, regardless of how many times the JS expression is repeated throughout the application.


# Part III - Customizing the dependencies

## Example 3a Specify change (or other) default event

Up to now, we've been defaulting the event type to "input" as far as knowing when to update the calculation.  But we can tweak that as shown below:

```html
<form>
    <input type="range" id="a" value="50">
    +<input type="number" id="b" value="25">
    =<output for="a b" 🧮=+ 🧮-on=change ></output>
</form>
```

## Alternative element references and/or event names for each observed element

Anything that requires subscribing to alternative or mixed event names, and/or that requires referencing nearby elements using something other than id's, needs to use an alternative to the *for* attribute.  We do so by adopting [DSS](https://github.com/bahrus/trans-render/wiki/VIII.--Directed-Scoped-Specifiers-(DSS)) to describe what to observe, and optionally when to act.

## Example 3b - References by n@me

```html
<form>
    <input type="range" name=a value="50">
    +<input type="number" name=b value="25">
    =<output 🧮-for="@a and @b" 🧮=+></output>
</form>
```

This still happens to assume, by default, that the "input" event is what we should listen for, but having adopted DSS syntax, we can specify any other event name we may want.   Id's and the *for* attribute are generated automatically by *be-calculating* in order to optimize our accessibility experience (if the for attribute/htmlFor property is found to be null/undefined).


# Part IV Applied to non output elements

This enhancement also supports other elements. 

Let's go in the opposite direction from before -- local to more global

## Example 4a - Local script

Once again, a framework or custom element host or local script can work in partnership with *be-calculating/🧮*:

```html

<input name=domain value=emojipedia.org>
<input name=search value=calculator>
<a id=link 🧮-for="@domain and @search">
    Emoji link
</a>
<script>
    link.addEventListener('be-calculating', e => e.r = `https://${e.f.domain}/search?q=${e.f.search}`)
</script>
```

(Using a form for the above example may be the better way to go).

## Example 4b - Gain full access to the element

In the examples above, we engaged in "mind reading" in order to pass to the event handler the precise values we want to use in order to calculate the result.

The DSS syntax this package relies on allows us to override these mind readings, and specify which property to pass.  

But what if you encounter this situation:

> Thanks but no thanks to all your "mind reading" -- could you please just pass in the dependent elements when they change? I have full, unfettered access to the JavaScript engine, so I can just extract things out of the elements that I need without your help!

To do so, specify this as follows:

```html
<form>
    <input type="range" id="a" value="50">
    +<input type="number" id="b" value="25">
    =<output id=output 🧮-for="#a:$0 and #b:$0"></output>
    <script>
        output.addEventListener('be-calculating', e => e.r = e.f.a.valueAsNumber + e.f.b.valueAsNumber);
    </script>
</form>
```

In particular, DSS now supports :$0 to specify the element itself as the thing that needs passing.




## [Demo](https://codepen.io/bahrus/pen/NWMjxYV)



## Viewing Locally

Any web server that serves static files will do but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.
4.  Install Python 3 or later.
5.  Open command window to folder where you cloned this repo.
6.  > npm install
7.  > npm run serve
8.  Open http://localhost:8000/demo in a modern browser.

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

