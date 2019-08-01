import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(private http: HttpClient, private router: Router) {
    }

    ngOnInit() {
        this.http.get('/api/users/me').subscribe(result => {
            this.router.navigate([`/${(<any>result).id}`])
        }, err => {
        })
    }

}
