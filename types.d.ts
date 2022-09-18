import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {PropObserveMap} from 'be-observant/types';
import {Matches} from 'trans-render/lib/types';

export type CalculatingMap<Props = any, Actions = Props, TEvent = Event> = string | PropObserveMap<Props, Actions, TEvent>;
export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> {
    args: CalculatingMap<Props, Actions, TEvent> | CalculatingMap<Props, Actions, TEvent>[];
    transformParent?: boolean,
    
    defaultProp?: string,
    defaultObserveType?: string,
    defaultEventType?: string,
    staticTransform?: Matches,
}

export interface VirtualProps extends EndUserProps, MinimalProxy<HTMLScriptElement>{
    transformGenerator: (et: EventTarget) =>  Matches;
    insertedBoilerPlate?: boolean;
    scriptLoaded?: boolean;
    readyToListen?: boolean;
    readyToTransform?: boolean;
    dynamicTransform?: Matches,
}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy
}

export type PP = ProxyProps;

export interface Actions{
    insertBoilerplate(pp: PP): void;
    loadScript(pp: PP): void;
    hookUpDynamicTransform(pp: PP): void;
    hookUpStaticTransform(pp: PP): void;
    listen(pp: PP): void;
    doDynamicTransform(pp: PP): void;
    finale(): void;
    
}