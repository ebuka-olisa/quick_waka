import { StaffClientsAddComponent } from './staff-clients-add/staff-clients-add.component';
import { StaffClientsListComponent } from './staff-clients-list/staff-clients-list.component';
import { Component } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-staff-clients-modal-container',
  template: '',
})
export class StaffClientsModalContainerComponent extends ModalContainerComponent {


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
                parentComponent: StaffClientsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            // set page title
            this.titleService.setTitle('Client Information | Quick Waka');

            const initialState = {
                title: 'Client information',
                Client: {id: params.id}
            };
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffClientsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.clientActivated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Client was activated successfully!');
                }
            );
            this.currentDialog.componentInstance.clientDeactivated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Client was deactivated successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Clients | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Clients | Quick Waka');

                router.navigateByUrl('/qm-staff/clients');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
