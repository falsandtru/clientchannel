import 'mocha';
import _assert from 'power-assert';

declare global {
  const assert: typeof _assert;

  interface NumberConstructor {
    isNaN(target: any): target is number;
  }

  interface IDBDatabase {
    onclose: (ev: Event) => void;
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
    onmessage: (ev: MessageEvent) => void;
    onmessageerror: (ev: MessageEvent) => void;
    close(): void;
    postMessage(message: any): void;
    addEventListener<K extends keyof BroadcastChannelEventMap>(type: K, listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => void, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  }

  interface BroadcastChannelEventMap {
    message: MessageEvent;
    messageerror: MessageEvent;
  }

}
