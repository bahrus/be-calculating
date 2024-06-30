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
            onLoad: {},
            defaultEventType: {},
            scriptEl: {},
            remoteSpecifiers: {},
            calculator: {},
            assignTo: {},
        },
        actions: {
            parseForAttr: {
                ifAllOf: ['forAttr']
            },
            regOnInput: {
                ifKeyIn: ['onInput']
            },
            regOnChange: {
                ifKeyIn: ['onChange']
            },
            regOnLoad: {
                ifKeyIn: ['onLoad']
            },
            findScriptEl: {
                ifNoneOf: ['onInput', 'onChange', 'onLoad']
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
        return this.#reg(onInput, 'input');
    }
    regOnChange(self) {
        const { onChange } = self;
        return this.#reg(onChange, 'change');
    }
    regOnLoad(self) {
        const { onLoad } = self;
        return this.#reg(onLoad, undefined);
    }
    #reg(on, defaultEventType) {
        if (on) {
            const scriptEl = document.createElement('script');
            scriptEl.innerHTML = on;
            return {
                scriptEl,
                defaultEventType
            };
        }
        else {
            return {
                defaultEventType: defaultEventType,
            };
        }
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
    findScriptEl(self) {
        const { enhancedElement, defaultEventType } = self;
        const scriptEl = enhancedElement.previousElementSibling;
        if (!(scriptEl instanceof HTMLScriptElement))
            throw 404;
        return {
            defaultEventType: defaultEventType || 'input',
            scriptEl
        };
    }
    async importSymbols(self) {
        const { scriptEl, nameOfCalculator } = self;
        const { emc } = await import('be-exportable/behivior.js');
        if (!scriptEl.src) {
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, scriptEl);
        }
        const exportable = await scriptEl.beEnhanced.whenResolved(emc);
        return {
            calculator: exportable.exports[nameOfCalculator]
        };
    }
    async hydrate(self) {
        const { calculator, remoteSpecifiers, enhancedElement, defaultEventType } = self;
        const remoteTuples = [];
        for (const remoteSpecifier of remoteSpecifiers) {
            const seeker = new Seeker(remoteSpecifier, false);
            const res = await seeker.do(self, undefined, enhancedElement);
            remoteTuples.push([remoteSpecifier, res]);
            const ac = new AbortController();
            this.#controllers?.push(ac);
            const { eventSuggestion } = res;
            const eventName = defaultEventType || eventSuggestion;
            if (eventName !== undefined) {
                res?.signal?.deref()?.addEventListener(eventName, e => {
                    this.#setValue(self, remoteTuples, calculator);
                }, { signal: ac.signal });
            }
        }
        await this.#setValue(self, remoteTuples, calculator);
        return {
            resolved: true
        };
    }
    async #setValue(self, remoteTuples, calculator) {
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
        const valueContainer = await calculator(vm);
        const { value } = valueContainer;
        if (enhancedElement instanceof HTMLOutputElement) {
            enhancedElement.value = value === undefined ? '' : (value + '');
        }
        else {
            if (value !== undefined) {
                const { assignTo } = self;
                let foundAtLeastOne = false;
                if (assignTo !== undefined) {
                    const { find } = await import('trans-render/dss/find.js');
                    for (const at of assignTo) {
                        const targetElement = await find(enhancedElement, at);
                        if (targetElement instanceof Element) {
                            foundAtLeastOne = true;
                            Object.assign(targetElement, value);
                        }
                    }
                }
                else {
                    const targetElement = enhancedElement.parentElement;
                    if (targetElement instanceof Element) {
                        foundAtLeastOne = true;
                        Object.assign(targetElement, value);
                    }
                }
                if (!foundAtLeastOne)
                    throw 404;
            }
        }
    }
    #controllers = [];
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
            this.#controllers = [];
        }
    }
    async detach(detachedElement) {
        this.#disconnect();
    }
}
await BeCalculating.bootUp();
export { BeCalculating };
