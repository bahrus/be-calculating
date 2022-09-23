import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {PropObserveMap, IObserve, WhatToObserve, WhenToAct, GetValConfig} from 'be-observant/types';
import {Matches, ProxyPropChangeInfo} from 'trans-render/lib/types';
import {EndUserProps as BeSyndicatingEndUserProps, VirtualProps as BeSyndicatingVirtualProps, Actions as BeSyndicatingActions} from 'be-syndicating/types';

export type CalculatingMap<Props = any, Actions = Props, TEvent = Event> = string | PropObserveMap<Props, Actions, TEvent>;

export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> extends BeSyndicatingEndUserProps<Props, Actions, TEvent> {
    //transformParent?: boolean,
    from:WhatToObserve,
    on: WhenToAct,
    get: GetValConfig,
    transform?: Matches | Matches[],
    calculator?: (et: EventTarget, ppci?: ProxyPropChangeInfo) => any,
    importCalculatorFrom?: string,
    importTransformFrom?: string,
    /**
     * Outer boundary that transform should act on.
     */
    transformScope?: {
        /**
         * use native function getRootNode() to set the boundary
         *
         */ 
        rootNode?: boolean;
        /**
         * Use the parent element as the boundary
         */
        parent?: boolean;
        /**
         * Use the native "closest" function to set the boundary
         */
        closest?: string;
    }
}

export interface VirtualProps extends EndUserProps, BeSyndicatingVirtualProps<HTMLScriptElement>{}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy,
}

export type PP = ProxyProps;

export interface Actions extends BeSyndicatingActions{
    //intro(proxy: Proxy, self: HTMLScriptElement): void,
    importSymbols(pp: PP): void,
    hookUpTransform(pp: PP): void,
    hookupCalc(pp: PP): void,
    
}