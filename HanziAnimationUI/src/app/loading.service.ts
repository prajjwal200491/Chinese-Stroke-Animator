import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Tracks how many backend HTTP requests are currently in flight so the UI can
 * show a loading indicator whenever any API call is pending.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private active = 0;
  readonly pending$ = new BehaviorSubject<boolean>(false);

  start(): void {
    this.active++;
    if (this.active === 1) {
      this.pending$.next(true);
    }
  }

  stop(): void {
    this.active = Math.max(0, this.active - 1);
    if (this.active === 0) {
      this.pending$.next(false);
    }
  }
}
