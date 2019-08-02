import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {SubscriptionsService} from "./subscriptions.service";

@Component({
    selector: 'app-subscriptions',
    templateUrl: './subscriptions.component.html',
    styleUrls: ['./subscriptions.component.css'],
    providers: [SubscriptionsService]
})
export class SubscriptionsComponent implements OnInit {

    @ViewChild('subscriptionEvents', {static: false}) subscriptionEvents: any;

    subscriptions;
    id: string;
    eventsPlaceholder = {
        events: ["job.created"]
    }

    constructor(private subscriptionsService: SubscriptionsService, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.id = params.get('id');
        });
        this.refresh();
    }

    async refresh() {
        this.subscriptions = await this.subscriptionsService.getSubscriptions(this.id);
    }

    async createSubscription() {
        await this.subscriptionsService.createSubscription(this.id, this.subscriptionEvents.nativeElement.innerText);
        await this.refresh();
    }

    async activateSubscription(subscriptionId: string) {
        await this.subscriptionsService.activateSubscription(this.id, subscriptionId);
        await this.refresh();
    }

    async deleteSubscription(subscriptionId: string) {
        await this.subscriptionsService.deleteSubscription(this.id, subscriptionId);
        await this.refresh();
    }

}
