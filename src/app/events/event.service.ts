import {Injectable, NgZone} from '@angular/core';
import {Event} from './event';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class EventService {
    observableEvents: Observable<Event[]>

    private baseWebhooksUrl = '/api/webhooks/';
    private events: Event[] = [];
    private _observableEvents: BehaviorSubject<Event[]>;

    constructor(private zone: NgZone, private http: HttpClient) {
        this._observableEvents = <BehaviorSubject<Event[]>>new BehaviorSubject([]);
        this.observableEvents = this._observableEvents.asObservable();
    }

    loadAll(id: any) {
        this.http.get(this.baseWebhooksUrl + id).subscribe(data => {
            if (data) {
                const reversed = (<any[]>data).map(event =>
                    new Event(event.body,
                        event.link,
                        event.name,
                        event.version,
                        event.receivedAt,
                        event.entity)).reverse();
                this.events.push(...reversed);
                this._observableEvents.next(this.events);
            }
        })
    }

    loadStream(id: any) {
        const eventSource = new EventSource(`${this.baseWebhooksUrl}${id}/stream`);
        eventSource.onmessage = event => {
            const eventJson = JSON.parse(event.data)
            this.events.unshift(
                new Event(eventJson.body,
                    eventJson.link,
                    eventJson.name,
                    eventJson.version,
                    eventJson.receivedAt,
                    eventJson.entity));
            this.zone.run(() => {
                this._observableEvents.next(this.events);
            });
        };
        eventSource.onerror = error => {
            if (eventSource.readyState === 0) {
                console.log('The stream has been closed by the server.');
                eventSource.close();
                this._observableEvents.complete();
            } else {
                this._observableEvents.error('EventSource error: ' + error);
            }
        };
    }
}
