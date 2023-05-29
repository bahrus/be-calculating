import {IBE} from 'be-enhanced/types';
import {Target, Scope, ProxyPropChangeInfo} from 'trans-render/lib/types';

export interface EndUserProps extends IBE{
    forAttribute?: string,
    for?: string,
    args?: string[],
    propertyToSet?: string,
    searchBy?: string,
    scriptRef?: Target,
    notify?: 'scope' | 'elementProps',
    scope?: Scope,
    recalculateOn?: string,
    nameOfCalculator?: string,
}

export interface AllProps extends EndUserProps{
    propertyBag?: EventTarget;
    calculator?: (et: EventTarget, ppci?: ProxyPropChangeInfo) => any,
    value: any;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>

export interface Actions{
    getDefaultForAttribute(self: this): PAP;
    getArgs(self: this): PAP;
    observe(self: this): ProPAP;
    importSymbols(self: this): ProPAP;
}