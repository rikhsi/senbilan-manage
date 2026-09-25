import { type IsoDateTime } from '@senbilan/core/domain';

/** Injectable time source so use cases are deterministic in tests. */
export abstract class Clock {
  abstract now(): Date;
  abstract nowIso(): IsoDateTime;
}

export abstract class IdGenerator {
  abstract next(): string;
}
