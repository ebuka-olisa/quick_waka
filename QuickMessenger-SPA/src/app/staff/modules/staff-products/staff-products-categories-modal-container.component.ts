import { StaffProductsCategoriesListComponent } from './staff-products-categories-list/staff-products-categories-list.component';
import { Component, OnInit } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffProductsCategoryAddComponent } from './staff-products-category-add/staff-products-category-add.component';

@Component({
  selector: 'app-staff-products-categories-modal-container',
  template: ''
})
export class StaffProductsCategoriesModalContainerComponent extends ModalContainerComponent {


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
                parentComponent: StaffProductsCategoriesListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Category | Quick Waka');

                initialState = {
                    title: 'Edit Category',
                    Category: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Category | Quick Waka');

                initialState = {
                    title: 'Add Category'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffProductsCategoryAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.categoryCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Category was created successfully!');
                }
            );
            this.currentDialog.componentInstance.categoryEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Category was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.categoryDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Category was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Categories | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Categories | Quick Waka');

                router.navigateByUrl('/qm-staff/products/categories');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
