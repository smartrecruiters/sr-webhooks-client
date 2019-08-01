import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

const baseUrl = 'api/users';

@Injectable()
export class SubscriptionsService {

    constructor(private http: HttpClient) {
    }

    private async request(method: string, url: string, data?: any) {
        const result = this.http.request(method, url, {
            body: data,
            responseType: 'json',
            observe: 'body',
            headers: new HttpHeaders({'Content-Type':'application/json'})
        });
        return new Promise<any>((resolve, reject) => {
            result.subscribe(resolve as any, reject as any);
        });
    }

    getSubscriptions(id: string) {
        return this.request('GET', `${baseUrl}/${id}/subscriptions`);
    }

    createSubscription(id: string, body: string) {
        return this.request('POST', `${baseUrl}/${id}/subscriptions`, body);
    }

    activateSubscription(id: string, subscriptionId: string) {
        return this.request('PUT', `${baseUrl}/${id}/subscriptions/${subscriptionId}`);
    }

    deleteSubscription(id:string, subscriptionId: string) {
        return this.request('DELETE', `${baseUrl}/${id}/subscriptions/${subscriptionId}`);
    }

}
