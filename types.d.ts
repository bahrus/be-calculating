import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {PropObserveMap} from 'be-observant/types';
import {Matches} from 'trans-render/lib/types';

export type CalculatingMap<Props = any, Actions = Props, TEvent = Event> = string | PropObserveMap<Props, Actions, TEvent>;
export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> {
    args: CalculatingMap<Props, Actions, TEvent> | CalculatingMap<Props, Actions, TEvent>[];
    transformParent?: boolean,
    transform?: Matches,
    defaultProp?: string,
    defaultObserveType?: string,
    defaultEventType?: string,
}

export interface VirtualProps extends EndUserProps, MinimalProxy<HTMLScriptElement>{
    transformGenerator: (et: EventTarget) =>  Matches;
    appendedBoilerPlate?: boolean;
    scriptLoaded?: boolean;
    readyToListen?: boolean;
    readyToTransform?: boolean;
}

export type Proxy = HTMLScriptElement & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy
}

export type PP = ProxyProps;

export interface Actions{
    //intro(proxy: Proxy, self: HTMLScriptElement): void;
    onTG(pp: PP): void;
    onNoTransform(pp: PP): void;
    onReadyToLoadScript(pp: PP): void;
    onStaticTransform(pp: PP): void;
    listen(pp: PP): void;
    finale(): void;
    doTransform(pp: PP): void;
}