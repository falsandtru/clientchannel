import { Observable, Observer } from 'spica';
import { localStorage, sessionStorage } from '../module/global';

type Type = ['local' | 'session'] | ['local' | 'session', string];

const storageEventStream = new Observable<Type, StorageEvent, void>();

export const eventstream: Observer<Type, StorageEvent, void> = storageEventStream;

void self.addEventListener('storage', event => {
  switch (event.storageArea) {
    case localStorage:
      return void storageEventStream.emit(typeof event.key === 'string' ? ['local', event.key] : ['local'], event);
    case sessionStorage:
      return void storageEventStream.emit(typeof event.key === 'string' ? ['session', event.key] : ['session'], event);
    default:
      return;
  }
});
