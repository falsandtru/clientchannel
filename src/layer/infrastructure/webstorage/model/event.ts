import { Observable, Observer } from 'spica';
import { localStorage, sessionStorage } from '../module/global';

const storageEvents = {
  localStorage: new Observable<['storage'], StorageEvent, void>(),
  sessionStorage: new Observable<['storage'], StorageEvent, void>()
};
export const events: {
  localStorage: Observer<['storage'], StorageEvent, void>;
  sessionStorage: Observer<['storage'], StorageEvent, void>;
} = storageEvents;

void window.addEventListener('storage', event => {
  switch (event.storageArea) {
    case localStorage:
      return void storageEvents.localStorage.emit(['storage'], event);
    case sessionStorage:
      return void storageEvents.sessionStorage.emit(['storage'], event);
    default:
      return;
  }
});
