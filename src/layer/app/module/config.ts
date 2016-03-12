import {LocalPortConfig} from 'localsocket';

export function configure<T>(config: LocalPortConfig<T>): StorageConfig<T> {
  return new StorageConfig(
    config.life,
    config.factory,
    config.destroy
  );
}

class StorageConfig<T> implements LocalPortConfig<T> {
  constructor(
    public life: number = 10,
    public factory: () => T,
    public destroy: (err: DOMError, event: Event) => boolean = () => true
  ) {
  }
}
