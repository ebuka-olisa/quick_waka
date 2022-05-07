import { StaffStaffListComponent } from './staff-staff-list/staff-staff-list.component';
import { StaffStaffAddComponent } from './staff-staff-add/staff-staff-add.component';
import { Component } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-staff-staff-modal-container',
  template: ''
})
export class StaffStaffModalContainerComponent extends ModalContainerComponent {


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
                parentComponent: StaffStaffListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Staff | Quick Waka');

                initialState = {
                    title: 'Edit Staff',
                    Staff: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Staff | Quick Waka');

                initialState = {
                    title: 'Add Staff'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffStaffAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.staffCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Staff was created successfully!');
                }
            );
            this.currentDialog.componentInstance.staffEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Staff was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.staffDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Staff was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Staff | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Staff | Quick Waka');

                router.navigateByUrl('/qm-staff/staff');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
