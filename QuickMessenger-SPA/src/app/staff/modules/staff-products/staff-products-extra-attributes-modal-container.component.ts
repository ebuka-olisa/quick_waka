import { StaffProductsExtraAttributesAddComponent } from './staff-products-extra-attributes-add/staff-products-extra-attributes-add.component';
import { StaffProductsExtraAttributesListComponent } from './staff-products-extra-attributes-list/staff-products-extra-attributes-list.component';
import { Component, OnInit } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-staff-products-extra-attributes-modal-container',
  template: ''
})
export class StaffProductsExtraAttributesModalContainerComponent extends ModalContainerComponent{


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
                parentComponent: StaffProductsExtraAttributesListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Extra Attribute | Quick Waka');

                initialState = {
                    title: 'Edit Extra Attribute',
                    ExtraAttribute: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Extra Attribute | Quick Waka');

                initialState = {
                    title: 'Add Extra Attribute'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffProductsExtraAttributesAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.extraAttributeCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Extra Attribute was created successfully!');
                }
            );
            this.currentDialog.componentInstance.extraAttributeEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Extra Attribute was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.extraAttributeDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Extra Attribute was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Extra Attributes | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Extra Attributes | Quick Waka');

                router.navigateByUrl('/qm-staff/products/extra_attributes');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
