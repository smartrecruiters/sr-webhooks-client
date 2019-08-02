import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {EventListComponent} from './events/event-list/event-list.component';
import {BrowserModule} from "@angular/platform-browser";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    },
    {
        path: ':id',
        component: EventListComponent
    }
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
