import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
export class BeCalculating extends BE {
    static get beConfig() {
        return {
            parse: true,
            primaryProp: 'for'
        };
    }
    getDefaultForAttribute(self) {
        const { enhancedElement } = self;
        switch (enhancedElement.localName) {
            case 'output':
                return {
                    forAttribute: 'for'
                };
            default:
                throw "Need list of id's";
        }
    }
    async importSymbols(self) {
        import('be-exportable/be-exportable.js');
        const { scriptRef, enhancedElement, nameOfCalculator } = self;
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef);
        if (target === null)
            throw 404;
        if (!target.src) {
            const { rewrite } = await import('../rewrite.js');
            rewrite(self, target);
        }
        const exportable = await target.beEnhanced.whenResolved('be-exportable');
        return {
            calculator: exportable.exports[nameOfCalculator]
        };
    }
    #controllers;
    async observe(self) {
        const { args, searchBy, scope, recalculateOn } = self;
        const defaultLink = {
            localInstance: 'local',
            enhancement: 'beCalculating',
            downstreamPropName: 'propertyBag',
            observe: {
                attr: searchBy,
                isFormElement: true,
                names: args,
                scope,
                on: recalculateOn
            }
        };
        const { observe } = await import('be-linked/observe.js');
        await observe(self, defaultLink);
        const { propertyBag, calculator } = self;
        this.#disconnect();
        this.#controllers = [];
        for (const arg of args) {
            const ac = new AbortController();
            propertyBag.addEventListener(arg, async (e) => {
                self.value = await calculator(propertyBag, e.detail);
            }, { signal: ac.signal });
            this.#controllers.push(ac);
        }
        return {
            value: await calculator(propertyBag),
            resolved: true,
        };
    }
    #disconnect() {
        if (this.#controllers !== undefined) {
            for (const ac of this.#controllers) {
                ac.abort();
            }
            this.#controllers = undefined;
        }
    }
    detach(detachedElement) {
        this.#disconnect();
    }
    getArgs(self) {
        const { for: forString } = self;
        let forS = forString;
        if (!forS) {
            const { forAttribute, enhancedElement } = self;
            forS = enhancedElement.getAttribute(forAttribute);
        }
        if (!forS)
            throw 404;
        return {
            args: forS.split(' ')
        };
    }
    onValue(self) {
    }
}
const tagName = 'be-calculating';
const ifWantsToBe = 'calculating';
const upgrade = '*';
const xe = new XE({
    config: {
        tagName,
        propDefaults: {
            ...propDefaults,
            scope: ['closestOrRootNode', 'form'],
            propertyToSet: 'value',
            searchBy: 'id',
            scriptRef: 'previousElementSibling',
            recalculateOn: 'change',
            nameOfCalculator: 'calculator'
        },
        propInfo: {
            ...propInfo,
        },
        actions: {
            getDefaultForAttribute: {
                ifNoneOf: ['forAttribute', 'for', 'args']
            },
            getArgs: {
                ifAtLeastOneOf: ['forAttribute', 'for']
            },
            importSymbols: {
                ifAllOf: ['scriptRef', 'nameOfCalculator']
            },
            observe: {
                ifAllOf: ['calculator', 'args']
            },
            onValue: {
                ifKeyIn: ['value'],
            }
        }
    },
    superclass: BeCalculating
});
register(ifWantsToBe, upgrade, tagName);
