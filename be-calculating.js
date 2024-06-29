import { config as beCnfg } from 'be-enhanced/config.js';
import { BE } from 'be-enhanced/BE.js';
import { Seeker } from 'be-linked/Seeker.js';
import { getObsVal } from 'be-linked/getObsVal.js';
class BeCalculating extends BE {
    static config = {
        propDefaults: {
            nameOfCalculator: 'calculator',
        },
        propInfo: {
            ...beCnfg.propInfo,
            forAttr: {},
            forArgs: {},
            onInput: {},
            onChange: {},
            defaultEventType: {},
            scriptEl: {},
            remoteSpecifiers: {},
            calculator: {},
        },
        actions: {
            parseForAttr: {
                ifAllOf: ['forAttr']
            },
            regOnInput: {
                ifAllOf: ['onInput']
            },
            regOnChange: {
                ifAllOf: ['onChange']
            },
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            importSymbols: {
                ifAllOf: ['scriptEl', 'remoteSpecifiers']
            },
            hydrate: {
                ifAllOf: ['calculator', 'remoteSpecifiers']
            }
        }
    };
    parseForAttr(self) {
        const { forAttr } = self;
        return {
            forArgs: forAttr?.split(' ').map(s => s.trim()),
        };
    }
    regOnInput(self) {
        const { onInput } = self;
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = onInput;
        return {
            defaultEventType: 'input',
            scriptEl
        };
    }
    regOnChange(self) {
        const { onChange } = self;
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = onChange;
        return {
            defaultEventType: 'change',
            scriptEl
        };
    }
    genRemoteSpecifiers(self) {
        const { forArgs, defaultEventType } = self;
        return {
            remoteSpecifiers: forArgs.map(fa => ({
                elS: fa,
                prop: fa,
                s: '#',
                evt: defaultEventType
            })),
        };
    }
    // async findScriptEl(self: this): ProPAP {
    //     const {scriptRef, enhancedElement} = self;
    //     const {findRealm} = await import('trans-render/lib/findRealm.js');
    //     const scriptEl = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
    //     if(scriptEl === null) throw 404;
    //     return {
    //         scriptEl
    //     }
    // }
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
    async hydrate(self) {
        const { calculator, remoteSpecifiers, enhancedElement } = self;
        const remoteTuples = [];
        for (const remoteSpecifier of remoteSpecifiers) {
            const seeker = new Seeker(remoteSpecifier, false);
            const res = await seeker.do(self, undefined, enhancedElement);
            remoteTuples.push([remoteSpecifier, res]);
        }
        const val = await this.#getValue(self, remoteTuples, calculator);
        if (enhancedElement instanceof HTMLOutputElement) {
            enhancedElement.value = val;
        }
        return {
            resolved: true
        };
    }
    async #getValue(self, remoteTuples, calculator) {
        const { enhancedElement } = self;
        const vm = {};
        for (const tuple of remoteTuples) {
            const [remoteSpecifier, rsae] = tuple;
            const remoteEndPoint = rsae.signal?.deref();
            if (remoteEndPoint === undefined) {
                //TODO:  remove from list
                continue;
            }
            const val = await getObsVal(remoteEndPoint, remoteSpecifier, enhancedElement);
            vm[remoteSpecifier.prop] = val;
        }
        return calculator(vm);
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
