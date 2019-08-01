export class Event {
    body: any;
    link: string;
    name: string;
    version: string;
    receivedAt: Date;
    entity: any;

    constructor(body: any, link: string, name: string, version:string, receivedAt: Date, entity: any) {
        this.body = body;
        this.link = link;
        this.name = name;
        this.version = version;
        this.receivedAt = receivedAt;
        this.entity = entity;
    }
}
