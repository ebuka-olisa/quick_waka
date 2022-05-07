import { Component, OnInit } from '@angular/core';
import { ModalContainerComponent } from 'src/app/shared/components/modal-container/modal-container.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { StaffProductsMeasurementMetricsListComponent } from './staff-products-measurement-metrics-list/staff-products-measurement-metrics-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StaffProductsMeasurementMetricsAddComponent } from './staff-products-measurement-metrics-add/staff-products-measurement-metrics-add.component';

@Component({
  selector: 'app-staff-products-measurement-metrics-modal-container',
  template: '',
})
export class StaffProductsMeasurementMetricsModalContainerComponent extends ModalContainerComponent {

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
                parentComponent: StaffProductsMeasurementMetricsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Add Measurement Metric | Quick Waka');

                initialState = {
                    title: 'Add Measurement Metric',
                    MeasurementMetric: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Edit Measurement Metric | Quick Waka');

                initialState = {
                    title: 'Add Measurement Metric'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(StaffProductsMeasurementMetricsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.measurementMetricCreated.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Measurement Metric was created successfully!');
                }
            );
            this.currentDialog.componentInstance.measurementMetricEdited.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Measurement Metric was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.measurementMetricDeleted.subscribe(
                () => {
                    this.currentDialog.dismiss('update');
                    this.notify.success('Measurement Metric was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Measurement Metrics | Quick Waka');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Measurement Metrics | Quick Waka');

                router.navigateByUrl('/qm-staff/products/measurement_metrics');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
