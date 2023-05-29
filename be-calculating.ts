import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP} from './types';
import {register} from 'be-hive/register.js';
import {Link} from 'be-linked/types';
import {AllProps as BeExportableAllProps} from 'be-exportable/types';

export class BeCalculating extends BE<AP, Actions> implements Actions{
    static  override get beConfig(){
        return {
            parse: true,
            primaryProp: 'for'
        } as BEConfig
    }

    getDefaultForAttribute(self: this): PAP {
        const {enhancedElement} = self;
        switch(enhancedElement.localName){
            case 'output':
                return {
                    forAttribute: 'for'
                } as PAP;
            default:
                throw "Need list of id's"
        }
    }

    async importSymbols(self: this): ProPAP {
        import('be-exportable/be-exportable.js');
        const {scriptRef, enhancedElement, nameOfCalculator} = self;
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
        if(target === null) throw 404;
        if(!target.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await (<any>target).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
        return {
            calculator: exportable.exports[nameOfCalculator!]
        }


    }
    #controllers : AbortController[] | undefined;
    async observe(self: this): ProPAP {
        const {args, searchBy, searchScope, recalculateOn} = self;
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
        } as Link;
        const {observe} = await import('be-linked/observe.js');
        await observe(self, defaultLink);
        const {propertyBag, calculator} = self;
        this.#disconnect();
        this.#controllers = [];
        for(const arg of args!){
            const ac = new AbortController();
            propertyBag!.addEventListener(arg, async e => {
                const result = await calculator!(propertyBag!, (e as CustomEvent).detail);
                Object.assign(self, result);
            }, {signal: ac.signal});
            this.#controllers.push(ac);
        }
        const result = await calculator!(propertyBag!);
        Object.assign(self, result);
        return {
            //value: await calculator!(propertyBag!),
            resolved: true,
        } as PAP;
    }

    
    #disconnect(){
        if(this.#controllers !== undefined){
            for(const ac of this.#controllers){
                ac.abort();
            }
            this.#controllers = undefined;
        }
    }

    override detach(detachedElement: Element): void {
        this.#disconnect();
    }

    getArgs(self: this): PAP {
        const {for: forString} = self;
        let forS: string | null | undefined = forString;
        if(!forS){
            const {forAttribute, enhancedElement} = self;
            forS = enhancedElement.getAttribute(forAttribute!);
        }
        if(!forS) throw 404;
        return {
            args: forS.split(' ')
        };
    }

    async onValue(self: this){
        const {enhancedElement, value, propertyToSet, notify} = self;
        (<any>enhancedElement)[propertyToSet!] = value;
        if(notify !== undefined){
            const {doNotify} = await import('./doNotify.js');
            await doNotify(self);
        }
    }
}

export interface BeCalculating extends AllProps{}

const tagName = 'be-calculating';
const ifWantsToBe = 'calculating';
const upgrade = '*';

const xe = new XE<AP, Actions>({
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
            getDefaultForAttribute:{
                ifNoneOf: ['forAttribute', 'for', 'args']
            },
            getArgs:{
                ifAtLeastOneOf: ['forAttribute', 'for']
            },
            importSymbols: {
                ifAllOf: ['scriptRef', 'nameOfCalculator']
            },
            observe:{
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