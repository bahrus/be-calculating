import {IEnhancement} from 'trans-render/be/types';
import {Target, Scope, ProxyPropChangeInfo} from 'trans-render/lib/types';

export interface EndUserProps extends IEnhancement<HTMLOutputElement | HTMLMetaElement>{
    //forAttribute?: string,
    for?: string,
    
    onInput?: string,
    
    // propertyToSet?: string,
    // searchBy?: string,
    // scriptRef?: Target,
    // notify?: 'scope' | 'elementProps',
    // searchScope?: Scope,
    // recalculateOn?: string,
    // nameOfCalculator?: string,
}

export interface AllProps extends EndUserProps{
    propertyBag?: EventTarget;
    calculator?: (et: EventTarget, ppci?: ProxyPropChangeInfo) => any,
    value: any;
    isParsed: boolean;
    attrExpr?: string | null;
    scriptEl?: HTMLScriptElement;
    defaultEventType?: string,
    forArgs?: string[],
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>

export interface Actions{
    //getDefaultForAttribute(self: this): PAP;
    //getAttrExpr(self: this): PAP;
    parseForAttr(self: this): PAP;
    regOnInput(self: this): PAP;
    //onAttrExpr(self: this): PAP;
    findScriptEl(self: this): ProPAP;
    //getArgs(self: this): PAP;
    //observe(self: this): ProPAP;
    importSymbols(self: this): ProPAP;
    //onValue(self: this): void;
}