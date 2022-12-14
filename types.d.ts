import {PropObserveMap,  WhatToObserve, WhenToAct, GetValConfig} from 'be-observant/types';
import {Matches, ProxyPropChangeInfo, Scope} from 'trans-render/lib/types';
import {EndUserProps as BeSyndicatingEndUserProps, VirtualProps as BeSyndicatingVirtualProps, Actions as BeSyndicatingActions} from 'be-syndicating/types';
import {EventConfigs} from 'be-decorated/types';

export type CalculatingMap<Props = any, Actions = Props, TEvent = Event> = string | PropObserveMap<Props, Actions, TEvent>;

export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> extends BeSyndicatingEndUserProps<Props, Actions, TEvent> {
    //transformParent?: boolean,
    from:WhatToObserve,
    on: WhenToAct,
    get: string | GetValConfig,
    transform?: Matches | Matches[],
    calculator?: (et: EventTarget, ppci?: ProxyPropChangeInfo) => any,
    nameOfCalculator?: string,
    nameOfTransform?: string,
    /**
     * Outer boundary that transform should act on.
     */
    transformScope?: Scope,
    
}

export interface VirtualProps extends EndUserProps, BeSyndicatingVirtualProps<HTMLScriptElement>{
    calcCount: number;
}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy,
}

export type PP = ProxyProps;

export type PPP = Partial<ProxyProps>;

export type PPE = [PPP, EventConfigs<Proxy, Actions>];

export interface Actions extends BeSyndicatingActions{
    importSymbols(pp: PP): Promise<PPE>,
    hookUpTransform(pp: PP): void,
    hookupCalc(pp: PP): void,
    assignScriptToProxy(pp: PP): void,
}