import { VisitorProductItemComponent } from './visitor-product-item/visitor-product-item.component';
import { Component } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-visitor-product-modal-container',
  template: ''
})
export class VisitorProductModalContainerComponent extends ModalContainerComponent {


    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Details | Quick Waka');

                initialState = {
                    title: '',
                    Product: {id: params.id}
                };
            } else {
                // set page title
                /*this.titleService.setTitle('Add Product | Quick Waka');

                initialState = {
                    title: 'Add Product'
                };*/
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Purchase Delivery | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Purchase Delivery | Quick Waka');

                router.navigateByUrl('/service/purchase_delivery');

                /*if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }*/
            });
        });
    }
}
