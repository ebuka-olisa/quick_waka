import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeasurementMetricViewModel } from 'src/app/models/measurement-metric';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { StaffProductsService } from '../staff-products.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-staff-products-measurement-metrics-add',
    templateUrl: './staff-products-measurement-metrics-add.component.html',
    styleUrls: ['./staff-products-measurement-metrics-add.component.css']
})
export class StaffProductsMeasurementMetricsAddComponent implements OnInit {
    @ViewChild('myForm', {static: false})
    private myForm: NgForm;

    @Output() measurementMetricCreated = new EventEmitter<any>();
    @Output() measurementMetricEdited = new EventEmitter<any>();
    @Output() measurementMetricDeleted = new EventEmitter<any>();

    @Input() initialState: any;

    title: string;

    MeasurementMetric: MeasurementMetricViewModel;
    OriginalMeasurementMetric: string;
    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;
    editMode: boolean;

    editMeasurementMetricReady = true;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private staffProductsService: StaffProductsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.MeasurementMetric = new MeasurementMetricViewModel();
    }

    ngOnInit() {
        // edit mode
        if (this.initialState.MeasurementMetric !== undefined) {
            this.MeasurementMetric = JSON.parse(JSON.stringify(this.initialState.MeasurementMetric));
            this.editMode = true;

            // get measurement metric information from server
            this.getMeasurementMetricForEdit();
        } else {
            this.completeMeasurementMetricSetup();
        }
    }

    close() {
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            const config: NgbModalOptions = {
                centered: true,
                keyboard: false,
                backdrop: 'static'
            };
            const modalRef = this.modalService.open(ConfirmExitComponent, config);
            modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                    modalRef.close();
                    this.activeModal.dismiss();
                }
            );
        }
    }


    // Measurement Metric Get, Create & Edit
    getMeasurementMetricForEdit() {
        this.editMeasurementMetricReady = false;

        this.staffProductsService.getMeasurementMetric(this.MeasurementMetric)
        .subscribe(
            // success
            response => {
                this.MeasurementMetric = response;

                this.completeMeasurementMetricSetup();

                this.editMeasurementMetricReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading measurement metric information, please reload page.');
                this.editMeasurementMetricReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    completeMeasurementMetricSetup() {
        // get copy of measurement metric to determine if change has been made
        this.OriginalMeasurementMetric = JSON.stringify(this.MeasurementMetric);
    }

    save() {
        this.processing = true;
        this.fieldErrors = {};

        if (!this.editMode) {
            this.createNewMeasurementMetric();
        } else {
            this.editMeasurementMetric();
        }
    }

    createNewMeasurementMetric() {
        this.staffProductsService.createMeasurementMetric(this.MeasurementMetric)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                this.measurementMetricCreated.emit();
                this.processing = false;
                this.reloadMeasurementMetricsListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService
                .showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editMeasurementMetric() {
        const myMeasurementMetric = this.MeasurementMetric;
        // myMeasurementMetric.pictureRemoved = this.profilePictureComponent.pictureRemoved;

        this.staffProductsService.editMeasurementMetric(myMeasurementMetric)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                this.measurementMetricEdited.emit();
                this.processing = false;
                this.reloadMeasurementMetricsListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    delete() {
        // show remove modal if metric can de deleted
        if (this.MeasurementMetric.candelete === undefined || this.MeasurementMetric.candelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Measurement Metric',
                action: 'Delete'
            };
            modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    // close modal
                    modalRef.close();

                    // delete
                    this.completeDelete();
                }
            );
        } else {
            // tell user that this item cannot be removed
            const modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                title: 'Measurement Metric In Use',
                message: 'This measurement metric cannot be deleted because it is being used by a category or product.',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffProductsService.deleteMeasurementMetric(this.MeasurementMetric)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.measurementMetricDeleted.emit();
                this.deleting = false;
                this.reloadMeasurementMetricsListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }

    reloadMeasurementMetricsListUsedByOthers() {
        if (this.staffProductsService.MeasurementMetricsList) {
            this.staffProductsService.getMeasurementMetricsFullList()
            .subscribe(
                // success
                response => {
                    this.staffProductsService.MeasurementMetricsList = response;
                },

                // error
                error => {}
            );
        }
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const metricnfoChanged = this.OriginalMeasurementMetric !== JSON.stringify(this.MeasurementMetric);
        return metricnfoChanged;
    }

}
