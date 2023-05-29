import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

const DEFAULT_ERROR_DELAY = 5000;

export interface IError {
    id: number;
    message?: string;
    delay: number;
    isLeft?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorService {
    private lastId = 0;
    private errors: IError[] = [];

    errors$ = new BehaviorSubject<IError[]>([]);

    constructor() {
    }

    /**
     * Emit new state of errors array
     */
    private emit() {
        this.errors$.next([...this.errors]);
    }

    /**
     * Returns error index
     */
    getIndex(error: IError): number {
        return this.errors.indexOf(error);
    }

    /**
     * Closes error
     */
    close(error: IError) {
        const idx = this.errors.findIndex(e => e === error);
        if (idx !== -1) {
            this.errors.splice(idx, 1);
            this.emit();
        }
    }

    /**
     * Shows error
     */
    show(message: string, isLeft = false, delay: number = DEFAULT_ERROR_DELAY) {
        // Generate id
        this.lastId++;

        // Add new error
        const error = {
            id: this.lastId,
            message,
            delay,
            isLeft
        };
        this.errors.push(error);

        // Remove error after delay
        if (delay !== 0) {
            setTimeout(() => {
                this.close(error);
            }, delay);
        }

        // Emit errors array
        this.emit();
    }
}
