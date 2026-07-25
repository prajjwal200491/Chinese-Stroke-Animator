import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BackendWakeupService } from './backend-wakeup.service';

// The free-tier App Service unloads after idle and the serverless SQL DB
// auto-pauses; the first requests after idle fail while they wake up. Instead
// of making the user reload 3-4 times, retry those calls with backoff.
const MAX_RETRIES = 6; // ~1+2+4+8+8+8 = up to ~31s of waiting
const RETRYABLE_STATUSES = [0, 500, 502, 503, 504];
const MAX_BACKOFF_MS = 8000;

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  constructor(private readonly wakeup: BackendWakeupService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only retry calls to our own backend API — never Auth0 or static assets.
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    let showingIndicator = false;

    return next.handle(req).pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, index) => {
            const attempt = index + 1;
            const status = error instanceof HttpErrorResponse ? error.status : 0;
            const retryable = RETRYABLE_STATUSES.indexOf(status) !== -1;

            if (!retryable || attempt > MAX_RETRIES) {
              return throwError(error);
            }

            // Backend is likely waking up — surface the indicator once and back off.
            if (!showingIndicator) {
              showingIndicator = true;
              this.wakeup.start();
            }
            const delayMs = Math.min(1000 * Math.pow(2, index), MAX_BACKOFF_MS);
            return timer(delayMs);
          })
        )
      ),
      finalize(() => {
        if (showingIndicator) {
          this.wakeup.stop();
        }
      })
    );
  }
}
