import { Injectable } from '@angular/core';
import { Clock, IdGenerator } from '@senbilan/core/application';
import { type IsoDateTime } from '@senbilan/core/domain';

@Injectable()
export class SystemClock extends Clock {
  override now(): Date {
    return new Date();
  }

  override nowIso(): IsoDateTime {
    return this.now().toISOString() as IsoDateTime;
  }
}

@Injectable()
export class CryptoIdGenerator extends IdGenerator {
  override next(): string {
    return globalThis.crypto.randomUUID();
  }
}
