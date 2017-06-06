namespace Identifier {
  declare class Event<T extends string> {
    private IDENTITY: T;
  }
  export type Number = Event<any> & number;

  export type Id = Event<'Id'> & number;
}

export type EventId = Identifier.Id;

export function makeEventId(id: Identifier.Number): void
export function makeEventId(id: number): EventId
export function makeEventId(id: number): EventId {
  assert(Number.isFinite(id));
  assert(Math.floor(id) === id);
  assert(id >= 0);
  return <EventId>id;
}
