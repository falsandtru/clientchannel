import { Inits } from 'spica/type';
import { ObserverOptions } from 'spica/observer';

export interface Observer<M extends readonly [unknown[], unknown, unknown]> {
  monitor<N extends Readonly<Inits<M[0]>>>(namespace: N, listener: Monitor<MOption<N, M>>, options?: ObserverOptions): () => void;
  on<N extends Readonly<M[0]>>(namespace: N, listener: Subscriber<SOption<N, M>>, options?: ObserverOptions): () => void;
  off<N extends Readonly<Inits<M[0]>>>(namespace: N, listener?: Subscriber<SOption<N, M>>): void;
  once<N extends Readonly<M[0]>>(namespace: N, listener: Subscriber<SOption<N, M>>): () => void;
}

type Monitor<M extends readonly [readonly unknown[], unknown, unknown]> = [M] extends [readonly [infer N, infer D, unknown]] ? [N] extends [readonly unknown[]] ? (data: D, namespace: Readonly<Inits<N>>) => void : never : never;
type Subscriber<M extends readonly [readonly unknown[], unknown, unknown]> = [M] extends [readonly [infer N, infer D, infer R]] ? [N] extends [readonly unknown[]] ? (data: D, namespace: N) => R : never : never;

type SOption<N extends readonly unknown[], M extends readonly [unknown[], unknown, unknown]> = M extends [infer T, unknown, unknown] ? N extends T ? M : never : never;
type MOption<N extends readonly unknown[], M extends readonly [unknown[], unknown, unknown]> = M extends [infer T, unknown, unknown] ? N extends T ? M : T extends readonly unknown[] ? N extends Inits<T> ? M : never : never : never;
