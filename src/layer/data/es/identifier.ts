import { EventStoreEvent, Id, makeIdentifier } from '../constraint/identifier';

export type EventId = EventStoreEvent<Id> & number;
export function makeEventId(id: EventId | Id): void
export function makeEventId(id: number): EventId
export function makeEventId(id: number & EventId): EventId {
  assert(Number.isFinite(+id));
  assert(id >= 0);
  return makeIdentifier(id);
}
