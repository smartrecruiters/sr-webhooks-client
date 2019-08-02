import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Router} from "@angular/router";
import {Injectable} from "@angular/core";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(private router : Router){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        this.router.navigate(['/']);
                    } else if (error.status === 403) {
                        this.router.navigate(['/']);
                    }
                    return throwError(error.message);
                })
            )
    }
}
