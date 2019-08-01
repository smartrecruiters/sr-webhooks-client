import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {EventDetailsComponent} from './events/event-details/event-details.component';
import {EventListComponent} from './events/event-list/event-list.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {SubscriptionsComponent} from './subscriptions/subscriptions.component';
import {LoginComponent} from './login/login.component';
import {HttpErrorInterceptor} from "./events/http-error.interceptor";

@NgModule({
    declarations: [
        AppComponent,
        EventDetailsComponent,
        EventListComponent,
        SubscriptionsComponent,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule
    ],
    providers: [{
     provide: HTTP_INTERCEPTORS,
     useClass: HttpErrorInterceptor,
     multi: true
    }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
