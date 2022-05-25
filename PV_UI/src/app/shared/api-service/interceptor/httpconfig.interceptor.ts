import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor() {}
  // intercept request add common preloader. /*/*
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            // console.log(event.status);
          }
        },
        error => {
          // http response status code
        }
      )
    );
  }
}
