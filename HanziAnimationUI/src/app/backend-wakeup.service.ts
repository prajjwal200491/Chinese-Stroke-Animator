import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Tracks whether one or more backend requests are currently being retried
 * because the (free-tier) Azure backend is cold-starting / the serverless DB
 * is resuming. The header/app uses `waking$` to show a "starting server" hint.
 */
@Injectable({ providedIn: 'root' })
export class BackendWakeupService {
  private inFlight = 0;
  readonly waking$ = new BehaviorSubject<boolean>(false);

  start(): void {
    this.inFlight++;
    if (this.inFlight === 1) {
      this.waking$.next(true);
    }
  }

  stop(): void {
    this.inFlight = Math.max(0, this.inFlight - 1);
    if (this.inFlight === 0) {
      this.waking$.next(false);
    }
  }
}
