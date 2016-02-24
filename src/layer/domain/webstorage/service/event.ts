import {Observable, IObservableObserver} from 'arch-stream';
import {events as sources} from '../../../infrastructure/webstorage/api';

export const events = {
  localStorage: subscribe(sources.localStorage),
  sessionStorage: subscribe(sources.sessionStorage)
};

function subscribe(source: IObservableObserver<'storage', StorageEvent, void>): IObservableObserver<string, StorageEvent, void> {
  const observer = new Observable<string, StorageEvent, void>();
  void source.on('storage', event => void observer.emit(event.key, event));
  return observer;
}
