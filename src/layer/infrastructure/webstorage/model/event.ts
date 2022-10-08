import { localStorage, sessionStorage } from '../module/global';
import { Observation, Observer } from 'spica/observer';

type Type = ['local' | 'session'] | ['local' | 'session', string];

export const storageEventStream$ = new Observation<Type, StorageEvent, void>({ limit: Infinity });
export const storageEventStream: Observer<Type, StorageEvent, void> = storageEventStream$;

self.addEventListener('storage', event => {
  switch (event.storageArea) {
    case localStorage:
      return void storageEventStream$.emit(event.key === null ? ['local'] : ['local', event.key], event);
    case sessionStorage:
      return void storageEventStream$.emit(event.key === null ? ['session'] : ['session', event.key], event);
    default:
      return;
  }
});
