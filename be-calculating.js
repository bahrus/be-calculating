import { config as beCnfg } from 'be-enhanced/config.js';
import { BE } from 'be-enhanced/BE.js';
class BeCalculating extends BE {
    static config = {
        propInfo: {
            ...beCnfg.propInfo,
            for: {},
            forArgs: {},
            onInput: {},
            defaultEventType: {},
        },
        actions: {
            parseForAttr: {
                ifAllOf: ['for']
            },
            regOnInput: {
                ifAllOf: ['onInput']
            }
        }
    };
    parseForAttr(self) {
        const { for: f } = self;
        return {
            forArgs: f?.split(' ').map(s => s.trim()),
        };
    }
    regOnInput(self) {
        const { onInput } = self;
        console.log({ onInput });
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = onInput;
        return {
            defaultEventType: 'input',
            scriptEl
        };
    }
    // getDefaultForAttribute(self: this): PAP {
    //     const {enhancedElement} = self;
    //     switch(enhancedElement.localName){
    //         case 'output':
    //             return {
    //                 forAttribute: 'for'
    //             } as PAP;
    //         default:
    //             throw "Need list of id's"
    //     }
    // }
    // getAttrExpr(self: this): PAP {
    //     const {enhancedElement, recalculateOn: r} = self;
    //     const recalculateOn = enhancedElement.hasAttribute('oninput') ? 'input':  'change';
    //     const attrExpr = enhancedElement.getAttribute('oninput') || enhancedElement.getAttribute('onchange');
    //     const scriptRef = attrExpr  ? undefined : 'previousElementSibling';
    //     return {
    //         attrExpr,
    //         recalculateOn,
    //         scriptRef,
    //     };
    // }
    onAttrExpr(self) {
        const { attrExpr } = self;
        //TODO optimize
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = attrExpr;
        return {
            scriptEl
        };
    }
    async findScriptEl(self) {
        const { scriptRef, enhancedElement } = self;
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const scriptEl = await findRealm(enhancedElement, scriptRef);
        if (scriptEl === null)
            throw 404;
        return {
            scriptEl
        };
    }
    async importSymbols(self) {
        const { scriptEl, nameOfCalculator } = self;
        import('be-exportable/be-exportable.js');
        if (!scriptEl.src) {
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, scriptEl);
        }
        const exportable = await scriptEl.beEnhanced.whenResolved('be-exportable');
        return {
            calculator: exportable.exports[nameOfCalculator]
        };
    }
    #controllers;
    // async observe(self: this): ProPAP {
    //     const {args, searchBy, searchScope, recalculateOn} = self;
    //     const defaultLink = {
    //         localInstance: 'local',
    //         enhancement: 'beCalculating',
    //         downstreamPropName: 'propertyBag',
    //         observe: {
    //             attr: searchBy,
    //             isFormElement: true,
    //             names: args,
    //             scope: searchScope,
    //             on: recalculateOn
    //         }
    //     } as Link;
    //     const {observe} = await import('be-linked/observe.js');
    //     await observe(self, defaultLink);
    //     const {propertyBag, calculator} = self;
    //     this.#disconnect();
    //     this.#controllers = [];
    //     for(const arg of args!){
    //         const ac = new AbortController();
    //         propertyBag!.addEventListener(arg, async e => {
    //             const result = await calculator!(propertyBag!, (e as CustomEvent).detail);
    //             Object.assign(self, result);
    //         }, {signal: ac.signal});
    //         this.#controllers.push(ac);
    //     }
    //     const result = await calculator!(propertyBag!);
    //     Object.assign(self, result);
    //     return {
    //         //value: await calculator!(propertyBag!),
    //         resolved: true,
    //     } as PAP;
    // }
    #disconnect() {
        if (this.#controllers !== undefined) {
            for (const ac of this.#controllers) {
                ac.abort();
            }
            this.#controllers = undefined;
        }
    }
    async detach(detachedElement) {
        this.#disconnect();
    }
}
await BeCalculating.bootUp();
export { BeCalculating };
