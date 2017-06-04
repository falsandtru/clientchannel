declare abstract class Identifier {
  private IDENTIFIER;
}
export declare abstract class Id extends Identifier {
  private ID;
}
export function makeIdentifier<I extends Identifier, T>(id: T): I & T {
  return <I & T>id;
}

declare abstract class EventStore<T> {
  private EVENT_STORE: T;
}
export declare abstract class EventStoreEvent<T> extends EventStore<T> {
  private EVENT_STORE_EVENT: T;
}
