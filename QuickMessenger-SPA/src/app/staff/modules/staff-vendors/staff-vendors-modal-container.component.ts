import { SharedService } from 'src/app/services/shared.service';
import { StaffVendorsListComponent } from './staff-vendors-list/staff-vendors-list.component';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { Component } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffVendorsAddComponent } from './staff-vendors-add/staff-vendors-add.component';
import { NotificationService } from 'src/app/services/notification.service';
import { DeactivationGuarded } from 'src/app/guards/deactivate.guard';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-staff-vendors-modal-container',
  template: ''
})
export class StaffVendorsModalContainerComponent extends ModalContainerComponent implements DeactivationGuarded{


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
                private sharedService: SharedService,
                parentComponent: StaffVendorsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Vendor | Quick Waka');

                initialState = {
                    title: 'Edit Vendor',
                    Vendor: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Vendor | Quick Waka');

                initialState = {
                    title: 'Add Vendor'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffVendorsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.vendorCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Vendor was created successfully!');
                }
            );
            this.currentDialog.componentInstance.vendorEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Vendor was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.vendorDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Vendor was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Vendors | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Vendors | Quick Waka');

                router.navigateByUrl('/qm-staff/vendors');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

    canDeactivate() {
        const hasChanges = this.currentDialog.componentInstance.changesMade();
        if (hasChanges) {
            // show another modal asking to discard changes
            /*const modalRef = this.modalService.open(ConfirmExitComponent, this.smallModalConfig);
            modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                    modalRef.close();
                    // this.activeModal.close();
                    // this.sharedService.navigateAwaySelection$.next(true);
                }
            );

            return this.sharedService.navigateAwaySelection$;*/
            return false;
        } else {
            return true;
        }
    }
}
