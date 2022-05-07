import { MeasurementMetricViewModel } from 'src/app/models/measurement-metric';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StaffProductsService } from '../staff-products.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ExtraAttributeDetailsViewModel } from 'src/app/models/extra-attributes';
import { Property } from 'src/app/models/category';

@Component({
    selector: 'app-staff-products-extra-attributes-select',
    templateUrl: './staff-products-extra-attributes-select.component.html',
    styleUrls: ['./staff-products-extra-attributes-select.component.css']
})
export class StaffProductsExtraAttributesSelectComponent implements OnInit {

    @Output() completeExtraAttributesSelection = new EventEmitter<any>();
    @Input() initialState: any;

    SelectedExtraAttributes: ExtraAttributeDetailsViewModel[] = [];

    SelectedCategoryId: number;

    Search: string;
    fieldErrors: any = {};
    processing = false;
    hasDisabled = false;

    extraAttributesReady = false;

    ExtraAttributes: ExtraAttributeDetailsViewModel[] = [];
    filteredItems: ExtraAttributeDetailsViewModel[] = [];

    constructor(private activeModal: NgbActiveModal,
                private staffProductsService: StaffProductsService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService) { }

    ngOnInit() {
        if (this.initialState && !this.initialState.SelectedProductCategoryId) {
            this.loadExtraAttributes();
        } else {
            this.SelectedCategoryId = this.initialState.SelectedProductCategoryId;
            this.loadCategoryProperties();
        }

        if (this.initialState && this.initialState.SelectedExtraAttributes) {
            this.SelectedExtraAttributes = this.initialState.SelectedExtraAttributes;
            for (const attr of this.SelectedExtraAttributes) {
                if (attr.candelete === false) {
                    const foundAttr = this.ExtraAttributes.find(o => o.id === attr.id);
                    if (foundAttr) {
                        foundAttr.candelete = false;
                        this.hasDisabled = true;
                    }
                }
            }
        }
    }

    close() {
        this.activeModal.dismiss();
    }

    assignCopy() {
        this.filteredItems = Object.assign([], this.ExtraAttributes);
    }


    // Search & Create
    filterItem(value: string) {
        if (!value) {
            this.assignCopy();
        } else {
            this.hasDisabled = false;
            this.filteredItems = Object.assign([], this.ExtraAttributes).filter(
                item => {
                    const selected = item.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
                    if (selected && item.canDelete === false) {
                        this.hasDisabled = true;
                    }
                    return selected;
                }
            );
        }
    }

    create() {
        this.processing = true;
        this.staffProductsService.createExtraAttribute({ id: 0,  name: this.Search })
        .subscribe(

            // success
            (response) => {
                this.processing = false;
                this.notify.success('Extra Attribute was created successfully!!');

                // add new entry to list
                // const newObj = {id: 11, name: this.Search, description: '', candelete: true};
                response.candelete = true;
                this.ExtraAttributes.push(response);
                this.staffProductsService.ExtraAttributesList = this.ExtraAttributes;

                // Select new item
                this.SelectedExtraAttributes.push(response);

                // reorder list

                // clear search string
                this.Search = null;
                this.filterItem(null);

                // stop processing
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

    // Load
    loadExtraAttributes() {
        this.extraAttributesReady = false;

        if (!this.staffProductsService.ExtraAttributesList) {
            this.staffProductsService.getExtraAttributesFullList()
            .subscribe(
                // success
                response => {
                    this.completeLoad(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading extra attributes list, please reload page.');
                }
            );
        } else {
            this.completeLoad(this.staffProductsService.ExtraAttributesList);
        }
    }

    loadCategoryProperties() {
        this.extraAttributesReady = false;

        if (!this.staffProductsService.LastProductCategorySelection
            || this.staffProductsService.LastProductCategorySelection !== this.SelectedCategoryId) {
            this.staffProductsService.getCategoryProperties(this.SelectedCategoryId)
            .subscribe(
                // success
                response => {
                    this.completePropertyLoad(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading extra attributes list, please reload page.');
                }
            );
        } else {
            this.completePropertyLoad(this.staffProductsService.CategorySelectionPropertyList);
        }
    }

    completeLoad(list: ExtraAttributeDetailsViewModel[]) {
        this.ExtraAttributes = list;
        for (const attr of this.ExtraAttributes) {
            attr.candelete = true;
            attr.isFromParent = false;
        }
        this.staffProductsService.ExtraAttributesList = this.ExtraAttributes;
        this.extraAttributesReady = true;

        this.assignCopy();

        for (const attr of this.SelectedExtraAttributes) {
            const foundAttr = this.filteredItems.find(x => x.id === attr.id);
            foundAttr.candelete = attr.candelete;
            foundAttr.isFromParent = attr.isFromParent;
        }
    }

    completePropertyLoad(list: Property[]) {
        this.staffProductsService.LastProductCategorySelection = this.SelectedCategoryId;
        this.staffProductsService.CategorySelectionPropertyList = list;

        // extract extra attributes
        this.ExtraAttributes = [];
        for (const property of list) {
            const existingAttribute: ExtraAttributeDetailsViewModel =
                this.ExtraAttributes.find(x => x.id === property.prod_PropertyTypeId);
            if (!existingAttribute) {
                /*const metrics: MeasurementMetricViewModel[] = [];
                if (property.measurementTypeSymbol != null) {
                    metrics.push({id: property.prod_MeasurementTypeId, symbol: property.measurementTypeSymbol, name: ''});
                }*/
                this.ExtraAttributes.push({id: property.prod_PropertyTypeId,
                    name: property.propertyTypeName, candelete: property.canDelete});
            } /*else {
                if (property.measurementTypeSymbol != null) {
                    existingAttribute.measurementMetrics.push(
                        {id: property.prod_MeasurementTypeId, symbol: property.measurementTypeSymbol, name: ''});
                }
            } else if (existingAttribute.candelete && !property.canDelete) {
                existingAttribute.candelete = false;
            }*/
        }

        // this.ExtraAttributes = list;
        this.extraAttributesReady = true;

        this.assignCopy();
    }


    // Select & Save
    toggleExtraAttribute(attribute: ExtraAttributeDetailsViewModel) {
        const index = this.SelectedExtraAttributes.findIndex(o => o.id === attribute.id);
        if (index === -1) {
            this.SelectedExtraAttributes.push({id: attribute.id,
                name: attribute.name,
                candelete: attribute.candelete || true});
        } else {
            this.SelectedExtraAttributes.splice(index, 1);
        }
    }

    isExtraAttributeSelected(id: number) {
        const selected = this.SelectedExtraAttributes.some(o => o.id === id);
        return selected;
    }

    save() {
        this.completeExtraAttributesSelection.emit(this.SelectedExtraAttributes);
    }

}
