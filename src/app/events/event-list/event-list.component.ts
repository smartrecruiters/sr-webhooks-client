import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Event} from '../event';
import {EventService} from '../event.service';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-event-list',
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.css'],
    providers: [EventService]
})
export class EventListComponent implements OnInit {
    events: Observable<Event[]>;
    selectedEvent: Event;
    username: string;
    id: string;

    constructor(private eventService: EventService, private route: ActivatedRoute, private http: HttpClient) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.id = params.get('id');

            this.events = this.eventService.observableEvents;
            this.eventService.loadAll(this.id);
            this.eventService.loadStream(this.id);
        });

        this.http.get('/api/users/me').subscribe(result => {
            this.username = (<any>result).displayName
        })
    }

    selectEvent(event: Event) {
        this.selectedEvent = event;
    }

    logout() {
        return this.http.delete(`/api/webhooks/${this.id}`).subscribe(() => true);
    }

}
