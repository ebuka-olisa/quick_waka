import { MeasurementMetricViewModel } from 'src/app/models/measurement-metric';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StaffProductsService } from '../staff-products.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
    selector: 'app-staff-products-measurement-metrics-select',
    templateUrl: './staff-products-measurement-metrics-select.component.html',
    styleUrls: ['./staff-products-measurement-metrics-select.component.css']
})
export class StaffProductsMeasurementMetricsSelectComponent implements OnInit {

    @Output() completeMeasurementMetricsSelection = new EventEmitter<any>();
    @Input() initialState: any;

    SelectedMeasurementMetrics: MeasurementMetricViewModel[] = [];

    Search: string;
    fieldErrors: any = {};
    processing = false;
    hasDisabled = false;
    createOpen = false;
    NewMeasurementMetric: MeasurementMetricViewModel;

    measurementMetricsReady = false;

    MeasurementMetrics: MeasurementMetricViewModel[] = [];
    filteredItems: MeasurementMetricViewModel[] = [];

    constructor(private activeModal: NgbActiveModal,
                private staffProductsService: StaffProductsService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService) { }

    ngOnInit() {
        this.loadMeasurementMetrics();
    }

    close() {
        this.activeModal.dismiss();
    }

    assignCopy() {
        this.filteredItems = Object.assign([], this.MeasurementMetrics);
    }


    // Load
    loadMeasurementMetrics() {
        this.measurementMetricsReady = false;

        if (!this.staffProductsService.MeasurementMetricsList) {
            this.staffProductsService.getMeasurementMetricsFullList()
            .subscribe(
                // success
                response => {
                    this.completeLoad(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading measurement metrics, please reload page.');
                }
            );
        } else {
            this.completeLoad(this.staffProductsService.MeasurementMetricsList);
        }
    }

    completeLoad(list: MeasurementMetricViewModel[]) {
        this.MeasurementMetrics = list;
        this.staffProductsService.MeasurementMetricsList = this.MeasurementMetrics;
        this.measurementMetricsReady = true;

        this.assignCopy();

        if (this.initialState && this.initialState.SelectedMeasurementMetrics) {
            this.SelectedMeasurementMetrics = this.initialState.SelectedMeasurementMetrics;
            for (const metric of this.SelectedMeasurementMetrics) {
                if (metric.candelete === false) {
                    const foundMetric = this.MeasurementMetrics.find(o => o.id === metric.id);
                    if (foundMetric) {
                        foundMetric.candelete = false;
                        this.hasDisabled = true;
                    }
                }
            }
        }
    }


    // Search & Create
    filterItem(value: string) {
        // when nothing is typed
        if (!value) {
            this.assignCopy();
        } else {
            this.hasDisabled = false;
            this.filteredItems = Object.assign([], this.MeasurementMetrics).filter(
                item =>  {
                    const selected =  item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        || item.symbol.toLowerCase().indexOf(value.toLowerCase()) > -1;
                    if (selected && item.canDelete === false) {
                        this.hasDisabled = true;
                    }
                    return selected;
                }
            );
        }
    }

    openCreate() {
        this.NewMeasurementMetric = { id: 0, name: this.Search, symbol: ''};
        this.createOpen = true;
    }

    closeCreate() {
        this.createOpen = false;
    }

    create() {
        this.processing = true;
        this.staffProductsService.createMeasurementMetric(this.NewMeasurementMetric)
        .subscribe(

            // success
            (response) => {
                // show success message
                this.notify.success('Measurement Metric was created successfully!!');
                this.closeCreate();

                // add new entry to list
                this.MeasurementMetrics.push(response);
                this.staffProductsService.MeasurementMetricsList = this.MeasurementMetrics;

                // Select new item
                this.SelectedMeasurementMetrics.push(response);

                // reorder list

                // clear search
                this.Search = null;
                this.assignCopy();
                this.processing = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                this.processing = false;
                // this.notify.error('Problem loading staff list, please reload page.');
            }
        );
    }


    // Select & Save
    toggleMeasurementMetric(metric: MeasurementMetricViewModel) {
        const index = this.SelectedMeasurementMetrics.findIndex(o => o.id === metric.id);
        if (index === -1) {
            this.SelectedMeasurementMetrics.push(
                {id: metric.id, name: metric.name, symbol: metric.symbol, candelete: metric.candelete || true});
        } else {
            this.SelectedMeasurementMetrics.splice(index, 1);
        }
    }

    isMeasurementMetricSelected(id: number) {
        const selected =  this.SelectedMeasurementMetrics.some(o => o.id === id);
        return selected;
    }

    save() {
        this.completeMeasurementMetricsSelection.emit(this.SelectedMeasurementMetrics);
    }

}
