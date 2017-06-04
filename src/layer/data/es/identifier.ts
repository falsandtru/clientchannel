namespace Identifier {
  declare abstract class Identifier<T extends string> {
    private IDENTITY: T;
  }
  export type Id = Identifier<'id'> & number;
}

export type EventId = Identifier.Id;

export function makeEventId(id: EventId): void
export function makeEventId(id: number): EventId
export function makeEventId(id: EventId): EventId {
  assert(Number.isFinite(id));
  assert(Math.floor(id) === id);
  assert(id >= 0);
  return id;
}
