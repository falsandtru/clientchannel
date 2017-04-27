import 'mocha';
import _assert from 'power-assert';

declare global {
  export const assert: typeof _assert;

  interface IDBDatabase {
    onclose: (ev: Event) => any;
  }

  type IDBValidValue
    = boolean
    | IDBValidKey
    | Object
    | File
    | Blob;

  interface Window {
    IDBKeyRange: typeof IDBKeyRange;
  }

  var BroadcastChannel: {
    prototype: BroadcastChannel;
    new (name: string): BroadcastChannel;
  }

  interface BroadcastChannel extends EventTarget {
    name: string;
    onmessage: (ev: MessageEvent) => any;
    onmessageerror: (ev: MessageEvent) => any;
    close(): void;
    postMessage(message: any): void;
    addEventListener<K extends keyof BroadcastChannelEventMap>(type: K, listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  }

  interface BroadcastChannelEventMap {
    message: MessageEvent;
    messageerror: MessageEvent;
  }

}
