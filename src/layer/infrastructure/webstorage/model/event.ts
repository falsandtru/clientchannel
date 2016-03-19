import {Observable, IObservableObserver} from 'arch-stream';
import {localStorage, sessionStorage} from '../module/global';

const storageEvents = {
  localStorage: new Observable<['storage'], StorageEvent, void>(),
  sessionStorage: new Observable<['storage'], StorageEvent, void>()
};
export const events: {
  localStorage: IObservableObserver<['storage'], StorageEvent, void>;
  sessionStorage: IObservableObserver<['storage'], StorageEvent, void>;
} = storageEvents;

void window.addEventListener('storage', event => {
  switch (event.storageArea) {
    case localStorage: {
      return void storageEvents.localStorage.emit(['storage'], event);
    }
    case sessionStorage: {
      return void storageEvents.sessionStorage.emit(['storage'], event);
    }
  }
});
