import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {PropObserveMap} from 'be-observant/types';
import {Matches, ProxyPropChangeInfo} from 'trans-render/lib/types';

export type CalculatingMap<Props = any, Actions = Props, TEvent = Event> = string | PropObserveMap<Props, Actions, TEvent>;
export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> {
    args: CalculatingMap<Props, Actions, TEvent> | CalculatingMap<Props, Actions, TEvent>[];
    transformParent?: boolean,
    defaultProp?: string,
    defaultObserveType?: string,
    defaultEventType?: string,
    transform?: Matches | Matches[],
    //transformGenerator?: (et: EventTarget) =>  Matches;
    calculator?: (et: EventTarget, ppci?: ProxyPropChangeInfo) => any;
}

export interface VirtualProps extends EndUserProps, MinimalProxy<HTMLScriptElement>{
    props?: Set<string>;
}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy
}

export type PP = ProxyProps;

export interface Actions{
    intro(proxy: Proxy, self: HTMLScriptElement): void;
    hookUpTransform(pp: PP): void;
    listen(pp: PP): void;
    hookupCalc(pp: PP): void;
    finale(): void;
    
}