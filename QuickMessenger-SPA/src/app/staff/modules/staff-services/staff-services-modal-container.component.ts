import { StaffServicesListComponent } from './staff-services-list/staff-services-list.component';
import { Component } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffServicesAddComponent } from './staff-services-add/staff-services-add.component';

@Component({
  selector: 'app-staff-services-modal-container',
  template: ''
})
export class StaffServicesModalContainerComponent extends ModalContainerComponent {


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
                parentComponent: StaffServicesListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Service | Quick Waka');

                initialState = {
                    title: 'Edit Service',
                    Service: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Service | Quick Waka');

                initialState = {
                    title: 'Add Service'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffServicesAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.serviceCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Service was created successfully!');
                }
            );
            this.currentDialog.componentInstance.serviceEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Service was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.serviceDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Service was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Services | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Services | Quick Waka');

                router.navigateByUrl('/qm-staff/services');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
