import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {PropObserveMap} from 'be-observant/types';

export interface EndUserProps<Props = any, Actions = Props, TEvent = Event> {
    args: PropObserveMap<Props, Actions, TEvent> | PropObserveMap<Props, Actions, TEvent>[];
}

export interface VirtualProps extends EndUserProps, MinimalProxy{}

export type Proxy = Element & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy
}

export type PP = ProxyProps;

export interface Actions{
    onArgs(pp: PP): void;
}