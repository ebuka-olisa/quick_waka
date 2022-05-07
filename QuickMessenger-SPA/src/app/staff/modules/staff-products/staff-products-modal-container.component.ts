import { StaffProductsListComponent } from './staff-products-list/staff-products-list.component';
import { Component } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffProductsAddComponent } from './staff-products-add/staff-products-add.component';

@Component({
  selector: 'app-staff-products-modal-container',
  template: ''
})
export class StaffProductsModalContainerComponent extends ModalContainerComponent {


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
                parentComponent: StaffProductsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Product | Quick Waka');

                initialState = {
                    title: 'Edit Product',
                    Product: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Product | Quick Waka');

                initialState = {
                    title: 'Add Product'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffProductsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.productCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Product was created successfully!');
                }
            );
            this.currentDialog.componentInstance.productCreated2.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Product was created successfully!');
                    this.notify.info('Pictures are being processed for the created product.');
                }
            );
            this.currentDialog.componentInstance.productEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Product was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.productDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Product was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Products | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Products | Quick Waka');

                router.navigateByUrl('/qm-staff/products');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
