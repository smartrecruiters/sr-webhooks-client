import {Component, Input, OnInit} from '@angular/core';
import {Event} from '../event';

@Component({
    selector: 'app-event-details',
    templateUrl: './event-details.component.html',
    styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
    @Input()
    event: Event;

    constructor() {
    }

    ngOnInit() {
    }

    getEventDetails(event: Event) {
        return {
            name: event.name,
            version: event.version,
            payload: event.body,
            link: event.link
        }
    }
}
