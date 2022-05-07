import { SharedService } from 'src/app/services/shared.service';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

export interface DeactivationGuarded {
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<DeactivationGuarded> {

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private sharedService: SharedService, private modalService: NgbModal) {}

    canDeactivate(component: DeactivationGuarded): Observable<boolean> | Promise<boolean> | boolean {
        const val = component.canDeactivate ? component.canDeactivate() : true;
        if (!val) {
            if (confirm('You have usaved changes! If you leave, your changes will be lost')) {
                return true;
            } else {
                return false;
            }
        }
        return val;
    }
}
