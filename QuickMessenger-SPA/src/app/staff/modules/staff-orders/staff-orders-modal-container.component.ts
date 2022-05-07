import { StaffOrdersListComponent } from './staff-orders-list/staff-orders-list.component';
import { Component, OnInit } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { StaffVendorsListComponent } from '../staff-vendors/staff-vendors-list/staff-vendors-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffOrdersEditComponent } from './staff-orders-edit/staff-orders-edit.component';

@Component({
    selector: 'app-staff-orders-modal-container',
    template: ''
})
export class StaffOrdersModalContainerComponent extends ModalContainerComponent {


    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    smallModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: StaffOrdersListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Order | Quick Waka');

                initialState = {
                    title: 'Edit Order',
                    Order: {id: params.id}
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffOrdersEditComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.orderEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Order was updated successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Orders | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Orders | Quick Waka');

                router.navigateByUrl('/qm-staff/orders');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
