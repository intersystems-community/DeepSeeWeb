import {EventEmitter, Injectable} from '@angular/core';
import {Subscription} from 'rxjs';

interface IBroadcast {
    message: string;
    value: any;
}

@Injectable({
    providedIn: 'root'
})
export class BroadcastService {

    private emitter = new EventEmitter<IBroadcast>();

    constructor() {
    }

    broadcast(message: string, value?: any) {
        this.emitter.emit({message, value});
    }

    subscribe(message: string, callback: (value: any) => void): Subscription {
        return this.emitter.subscribe((b: IBroadcast) => {
            if (b.message === message) {
                callback(b.value);
            }
        });
    }
}
