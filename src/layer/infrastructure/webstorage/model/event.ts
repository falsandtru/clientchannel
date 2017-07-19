import { Observation, Observer } from 'spica/observation';
import { localStorage, sessionStorage } from '../module/global';

type Type = ['local' | 'session'] | ['local' | 'session', string];

export const storageEventStream_ = new Observation<Type, StorageEvent, void>();
export const storageEventStream: Observer<Type, StorageEvent, void> = storageEventStream_;

void self.addEventListener('storage', event => {
  switch (event.storageArea) {
    case localStorage:
      return void storageEventStream_.emit(typeof event.key === 'string' ? ['local', event.key] : ['local'], event);
    case sessionStorage:
      return void storageEventStream_.emit(typeof event.key === 'string' ? ['session', event.key] : ['session'], event);
    default:
      return;
  }
});
