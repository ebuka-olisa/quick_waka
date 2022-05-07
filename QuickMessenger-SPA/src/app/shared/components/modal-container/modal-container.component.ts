import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-modal-container',
    template: ''
})
export class ModalContainerComponent implements OnDestroy, AfterViewInit {

    destroy = new Subject<any>();
    currentDialog = null;
    subscription: Subscription;

    constructor(private router: Router) { }

    ngOnDestroy() {
        this.destroy.next();
        // this.subscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (this.currentDialog != null) {
                    this.currentDialog.close();
                    this.currentDialog = null;
                    this.subscription.unsubscribe();
                }
            }
        });
    }

}
