import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
export class BeCalculating extends BE {
    static get beConfig() {
        return {
            parse: true,
            primaryProp: 'for',
            isParsedProp: 'isParsed'
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
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await target.beEnhanced.whenResolved('be-exportable');
        return {
            calculator: exportable.exports[nameOfCalculator]
        };
    }
    #controllers;
    async observe(self) {
        const { args, searchBy, searchScope, recalculateOn } = self;
        const defaultLink = {
            localInstance: 'local',
            enhancement: 'beCalculating',
            downstreamPropName: 'propertyBag',
            observe: {
                attr: searchBy,
                isFormElement: true,
                names: args,
                scope: searchScope,
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
                const result = await calculator(propertyBag, e.detail);
                Object.assign(self, result);
            }, { signal: ac.signal });
            this.#controllers.push(ac);
        }
        const result = await calculator(propertyBag);
        Object.assign(self, result);
        return {
            //value: await calculator!(propertyBag!),
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
    async onValue(self) {
        const { enhancedElement, value, propertyToSet, notify } = self;
        enhancedElement[propertyToSet] = value;
        if (notify !== undefined) {
            const { doNotify } = await import('./doNotify.js');
            await doNotify(self);
        }
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
            searchScope: ['closestOrRootNode', 'form'],
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
                ifAllOf: ['isParsed'],
                ifNoneOf: ['forAttribute', 'for', 'args']
            },
            getArgs: {
                ifAtLeastOneOf: ['forAttribute', 'for']
            },
            importSymbols: {
                ifAllOf: ['scriptRef', 'nameOfCalculator', 'args']
            },
            observe: {
                ifAllOf: ['calculator', 'args']
            },
            onValue: {
                ifAllOf: ['propertyToSet', 'value'],
            }
        }
    },
    superclass: BeCalculating
});
register(ifWantsToBe, upgrade, tagName);
