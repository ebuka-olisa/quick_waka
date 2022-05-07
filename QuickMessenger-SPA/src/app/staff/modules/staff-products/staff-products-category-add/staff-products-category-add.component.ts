import { ValidationErrorService } from './../../../../services/validation-error.service';
import { MeasurementMetricViewModel } from 'src/app/models/measurement-metric';
import { StaffProductsService } from './../staff-products.service';
import { CategoryDetailsViewModel, Property } from './../../../../models/category';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbModalOptions, NgbActiveModal, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { StaffProductsExtraAttributesSelectComponent } from '../staff-products-extra-attributes-select/staff-products-extra-attributes-select.component';
import { ExtraAttributeDetailsViewModel } from 'src/app/models/extra-attributes';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';
import { NotificationService } from 'src/app/services/notification.service';
import { StaffProductsMeasurementMetricsSelectComponent } from '../staff-products-measurement-metrics-select/staff-products-measurement-metrics-select.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
    selector: 'app-staff-products-category-add',
    templateUrl: './staff-products-category-add.component.html',
    styleUrls: ['./staff-products-category-add.component.css']
})
export class StaffProductsCategoryAddComponent implements OnInit, OnDestroy {

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @Input() initialState: any;

    @Output() categoryCreated = new EventEmitter<any>();
    @Output() categoryEdited = new EventEmitter<any>();
    @Output() categoryDeleted = new EventEmitter<any>();

    title: string;

    editCategoryReady = true;
    Category: CategoryDetailsViewModel;
    OriginalCategory: string;

    SelectedExtraAttributes: ExtraAttributeDetailsViewModel[] = [];

    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;
    editMode: boolean;
    loadedFirstParentProperties: boolean;

    modalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };
    selectModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    categoriesReady = false;
    Categories: CategoryDetailsViewModel[];

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any = {
        min_height: 200,
        max_height: 500,
        theme: 'modern',
        statusbar: false,
        menubar: false,
        toolbar_drawer: 'floating',
        plugins: 'autoresize fullscreen autolink image imagetools link codesample lists textcolor colorpicker',
        toolbar: 'bold italic underline strikethrough | forecolor formatselect | numlist bullist | outdent indent |'
            + ' link removeformat fullscreen',
        setup(editor) {
            editor.on('focus', (e) => {
                jQuery(editor.getContainer()).addClass('focus');
            });
            editor.on('blur', (e) => {
                jQuery(editor.getContainer()).removeClass('focus');
            });
        }
    };

    selectizeConfig = {
        labelField: 'name',
        valueField: 'id',
        searchField: 'name',
        maxItems: 1,
        highlight: true,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) {
                let buildString = '';
                let parent = item.parent || null;
                while (parent) {
                    buildString = '<span class="opacity-5 font-12">' + escape(parent.name) + ' / </span>' + buildString;
                    parent = parent.parent;
                }
                buildString = '<div>' + buildString + '<span class="font-14">' + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                let buildString = '';
                let parent = item.parent || null;
                while (parent) {
                    buildString = '<span class="opacity-5 font-12">' + escape(parent.name) + ' / </span>' + buildString;
                    parent = parent.parent;
                }
                buildString = '<div>' + buildString + '<span class="font-14">' + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private staffProductsService: StaffProductsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {
        this.Category = new CategoryDetailsViewModel();
    }

    ngOnInit() {
        // load categories
        this.loadCategories();

        // if in edit mode
        if (this.initialState && this.initialState.Category) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.Category = JSON.parse(JSON.stringify(this.initialState.Category));

            // get properties information from server
            this.getCategoryForEdit();
        } else {
            this.OriginalCategory = JSON.stringify(this.Category);
        }
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    close() {
        // (!this.editMode && !this.myForm.dirty)
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            const modalRef = this.modalService.open(ConfirmExitComponent, this.modalConfig);
            modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                modalRef.close();
                this.activeModal.dismiss();
                }
            );
        }
    }


    // Description Operations
    descriptionReady() {
        this.descriptionTextAreaReady = true;
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const categoryInfoChanged = this.OriginalCategory !== JSON.stringify(this.Category);
        return categoryInfoChanged;
    }


    // Parent Category
    getParentProperties() {
        if ((this.editMode && this.loadedFirstParentProperties) || !this.editMode) {
            // remove attributes of previous parent
            for (let j = 0; j < this.SelectedExtraAttributes.length; j++) {
                if (this.SelectedExtraAttributes[j].isFromParent) {
                    // remove properties
                    for (let i = this.Category.properties.length - 1; i >= 0; i--) {
                        if (this.Category.properties[i].prod_PropertyTypeId === this.SelectedExtraAttributes[j].id) {
                            this.Category.properties.splice(i, 1);
                        }
                    }
                    this.SelectedExtraAttributes.splice(j, 1);
                }
            }

            // get attributes of new parent
            const parentId = Number(this.Category.parentId);
            if (parentId !== 0 && !isNaN(parentId)) {
                this.staffProductsService.getCategoryProperties(parseInt(this.Category.parentId, 10))
                    .subscribe(
                        // success
                        response => {
                            const verifiedExtraAttributes: number[] = [];

                            // add attributes to current list
                            for (const property of response) {
                                const existingAttribute: ExtraAttributeDetailsViewModel =
                                    this.SelectedExtraAttributes.find(x => x.id === property.prod_PropertyTypeId);

                                if (!existingAttribute) {
                                    const newExtraAttribute: ExtraAttributeDetailsViewModel = {
                                        id: property.prod_PropertyTypeId,
                                        name : property.propertyTypeName,
                                        candelete: property.canDelete,
                                        isFromParent: true
                                    };

                                    // add attr
                                    this.SelectedExtraAttributes.push(newExtraAttribute);
                                } else {
                                    if (!property.canDelete && existingAttribute.candelete) {
                                        existingAttribute.candelete = false;
                                    }
                                    if (!existingAttribute.isFromParent) {
                                        existingAttribute.isFromParent = true;
                                    }

                                    // remove properties (measurement types) added before selecting this parent
                                    if (verifiedExtraAttributes.find(x => x === property.prod_PropertyTypeId) == null) {
                                        verifiedExtraAttributes.push(property.prod_PropertyTypeId);
                                        for (let i = this.Category.properties.length - 1; i >= 0; i--) {
                                            if (this.Category.properties[i].prod_PropertyTypeId === property.prod_PropertyTypeId
                                                && this.Category.properties[i].prod_CategoryId !== property.prod_CategoryId) {
                                                    this.Category.properties.splice(i, 1);
                                                }
                                        }
                                    }
                                }

                                if (!this.Category.properties) {
                                    this.Category.properties = [];
                                }

                                this.Category.properties.push({
                                    id: property.id,
                                    measurementTypeSymbol: property.measurementTypeSymbol ? property.measurementTypeSymbol : 'None',
                                    prod_CategoryId: property.prod_CategoryId,
                                    prod_PropertyTypeId: property.prod_PropertyTypeId,
                                    propertyTypeName: '',
                                    prod_MeasurementTypeId: property.prod_MeasurementTypeId,
                                    canDelete: property.canDelete});
                            }
                        },

                        // error
                        error => {
                            this.notify.error('Problem loading extra attributes, please reload page.');
                        }
                    );
            }
        } else {
            this.loadedFirstParentProperties = true;
        }

    }


    // Extra Attributes
    getSelectedExtraAttributes() {
        this.SelectedExtraAttributes = [];
        for (const property of this.Category.properties) {
            const existingProperty: ExtraAttributeDetailsViewModel =
                this.SelectedExtraAttributes.find(x => x.id === property.prod_PropertyTypeId);
            if (!existingProperty) {
                const parentCatProperty = property.prod_CategoryId && this.Category.parentId
                    && property.prod_CategoryId !== this.Category.id;
                this.SelectedExtraAttributes.push({
                    id: property.prod_PropertyTypeId,
                    name: property.propertyTypeName,
                    candelete: property.canDelete, // parentCatProperty ? false : property.canDelete,
                    isFromParent: parentCatProperty});
            } else if (existingProperty.candelete && !property.canDelete) {
                existingProperty.candelete = false;
            }
        }
    }

    addExtraAttribute() {
        const initialState = {
            SelectedExtraAttributes: JSON.parse(JSON.stringify(this.SelectedExtraAttributes))
        };
        this.modalRef = this.modalService.open(StaffProductsExtraAttributesSelectComponent, this.selectModalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.completeExtraAttributesSelection.subscribe(
            (SelectedAttributes: ExtraAttributeDetailsViewModel[]) => {
                this.modalRef.close();
                // this.SelectedExtraAttributes = SelectedAttributes;
                // remove deselected attributes and their properties
                for (let i = this.SelectedExtraAttributes.length - 1; i >= 0; i--) {
                    const attr = this.SelectedExtraAttributes[i];
                    const found = SelectedAttributes.some(o => o.id === attr.id);
                    if (!found) {
                        // remove properties
                        this.deletePropertiesForExtraAttribute(attr.id);

                        // remove attr
                        this.SelectedExtraAttributes.splice(i, 1);
                    }
                }

                // create dummy property for newly added attributes
                for (const attr of SelectedAttributes) {
                    const found = this.SelectedExtraAttributes.some(o => o.id === attr.id);
                    if (!found) {
                        // dummy properties
                        if (this.Category.properties === undefined || this.Category.properties === null) {
                            this.Category.properties = [];
                        }
                        this.Category.properties.push(
                            {
                                prod_CategoryId: (this.editMode ? this.Category.id : 0),
                                prod_PropertyTypeId : attr.id,
                                propertyTypeName : attr.name,
                                canDelete : true
                            });

                        // add attr
                        this.SelectedExtraAttributes.push({id: attr.id,
                            name: attr.name, candelete: true});
                    }
                }
            }
        );
    }

    removeExtraAttribute(attribute: ExtraAttributeDetailsViewModel) {
        // show remove modal if attribute can de deleted
        if ((attribute.candelete === undefined || attribute.candelete === true) && !attribute.isFromParent) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Extra Attribute',
                action: 'Remove'
            };
            modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    modalRef.close();

                    // remove properties
                    for (let i = this.Category.properties.length - 1; i >= 0; i--) {
                        if (this.Category.properties[i].prod_PropertyTypeId === attribute.id) {
                            this.Category.properties.splice(i, 1);
                        }
                    }

                    // remove selected attribute
                    for (let j = 0; j < this.SelectedExtraAttributes.length; j++) {
                        if (this.SelectedExtraAttributes[j].id === attribute.id) {
                            this.SelectedExtraAttributes.splice(j, 1);
                        }
                    }
                }
            );
        } else {
            // tell user that this item cannot be removed
            const modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                title: 'Extra Attribute In Use',
                message: attribute.isFromParent && attribute.isFromParent === true ?
                    'This extra attribute cannot be removed because it belongs to a parent category' :
                    'This extra attribute cannot be removed because it is being used by a product.',
                icon: 'warning'
            };
        }
    }


    // Measurement Metric/Property Operations
    getPropertiesWithThisExtraAttribute(id: number) {
        return this.Category.properties ? this.Category.properties.filter(o => o.prod_PropertyTypeId === id
            && o.prod_MeasurementTypeId !== undefined && o.prod_MeasurementTypeId !== null) : null;
    }

    getSelectedMeasurementMetrics(attribute: ExtraAttributeDetailsViewModel) {
        const SelectedMeasurementMetrics: MeasurementMetricViewModel[] = [];
        const properties = this.Category.properties ? this.Category.properties.filter(o => o.prod_PropertyTypeId === attribute.id) : [];
        for (const property of properties) {
            SelectedMeasurementMetrics.push({id: property.prod_MeasurementTypeId, name: '', symbol: property.measurementTypeSymbol,
                candelete: property.canDelete});
        }

        return SelectedMeasurementMetrics;
    }

    addMeasurementMetric(attribute: ExtraAttributeDetailsViewModel) {
        const initialState = {
            SelectedMeasurementMetrics: JSON.parse(JSON.stringify(this.getSelectedMeasurementMetrics(attribute)))
        };
        this.modalRef = this.modalService.open(StaffProductsMeasurementMetricsSelectComponent, this.selectModalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.completeMeasurementMetricsSelection.subscribe(
            (SelectedMetrics: MeasurementMetricViewModel[]) => {
                this.modalRef.close();

                // remove deselected mterics
                for (let i = this.Category.properties.length - 1; i >= 0; i--) {
                    const prop = this.Category.properties[i];
                    if (prop.prod_PropertyTypeId === attribute.id) {
                        const found = SelectedMetrics.some(o => o.id === prop.prod_MeasurementTypeId);
                        if (!found) {
                            // remove attr
                            this.Category.properties.splice(i, 1);
                        }
                    }
                }

                // create property for newly measurement metrics
                for (const metric of SelectedMetrics) {
                    const found = this.Category.properties.some(o => o.prod_PropertyTypeId === attribute.id
                        && o.prod_MeasurementTypeId === metric.id);
                    if (!found) {
                        this.Category.properties.push(
                            {
                                prod_CategoryId: (this.editMode ? this.Category.id : 0),
                                prod_PropertyTypeId : attribute.id,
                                propertyTypeName : attribute.name,
                                prod_MeasurementTypeId : metric.id,
                                measurementTypeSymbol : metric.symbol,
                                canDelete : true
                            });
                    }
                }
            }
        );
    }

    removeProperty(property: Property) {
        // show remove modal if property can de deleted
        if (property.canDelete === undefined || property.canDelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Measurement Metric',
                action: 'Remove'
            };
            modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    // close modal
                    modalRef.close();

                    // remove property/measurement metric
                    for (let i = this.Category.properties.length - 1; i >= 0; i--) {
                        const prop = this.Category.properties[i];
                        if (prop.prod_PropertyTypeId === property.prod_PropertyTypeId
                            && prop.prod_MeasurementTypeId === property.prod_MeasurementTypeId) {
                            this.Category.properties.splice(i, 1);
                            break;
                        }
                    }
                }
            );
        } else {
            // tell user that this item cannot be removed
            const modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                title: 'Measurement Metric In Use',
                message: 'This measurement metric cannot be removed because it is being used by a product.',
                icon: 'warning'
            };
        }
    }

    deletePropertiesForExtraAttribute(id: number) {
        for (let i = this.Category.properties.length - 1; i >= 0; i--) {
            const prop = this.Category.properties[i];
            if (prop.prod_PropertyTypeId === id) {
                this.Category.properties.splice(i, 1);
            }
        }
    }


    // Category (Retrieve, Create, Edit & Delete)
    getCategoryForEdit() {
        this.editCategoryReady = false;

        this.staffProductsService.getCategory(this.Category)
        .subscribe(
            // success
            response => {
                this.Category = response;

                // Get unique list of extra attributes
                if (this.Category.properties && this.Category.properties.length > 0) {
                    this.getSelectedExtraAttributes();
                }

                // Get category parent
                if (this.categoriesReady && this.Category.parent) {
                    this.Category.parentId = this.Category.parent.id.toString();
                } else {
                    this.loadedFirstParentProperties = true;
                }

                // get copy of category to determine if change has been made
                this.OriginalCategory = JSON.stringify(this.Category);

                this.editCategoryReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading category information, please reload page.');
                this.editCategoryReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    loadCategories() {
        this.categoriesReady = false;

        if (!this.staffProductsService.ParentCategoriesList) {
            this.staffProductsService.getPotentialParentCategoriesList()
            .subscribe(
                // success
                response => {
                    this.completeLoad(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading category list, please reload page.');
                }
            );
        } else {
            this.completeLoad(this.staffProductsService.ParentCategoriesList);
        }
    }

    completeLoad(list: CategoryDetailsViewModel[]) {
        this.Categories = list;
        this.staffProductsService.ParentCategoriesList = this.Categories;
        this.categoriesReady = true;

        // Get category parent
        if (this.editMode && this.editCategoryReady && this.Category.parent) {
            this.Category.parentId = this.Category.parent.id.toString();

            // get copy of category to determine if change has been made
            this.OriginalCategory = JSON.stringify(this.Category);
        }
    }

    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain product information
        const catObj: CategoryDetailsViewModel = JSON.parse(JSON.stringify(this.Category));

        // process parent category info
        if (catObj.parentId === '') {
            catObj.parentId = '0';
        }
        catObj.parent = null;

        // remove parent category properties
        if (catObj.properties) {
            for (let i = catObj.properties.length - 1; i >= 0; i--) {
                if (!this.editMode && catObj.properties[i].id) {
                    catObj.properties.splice(i, 1);
                }
                if (this.editMode && catObj.properties[i].prod_CategoryId !== catObj.id) {
                    catObj.properties.splice(i, 1);
                }
            }
        }

        if (!this.editMode) {
            this.createNewCategory(catObj);
        } else {
            this.editCategory(catObj);
        }
    }

    createNewCategory(catObj: CategoryDetailsViewModel) {

        this.staffProductsService.createCategory(catObj)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload category list
                this.categoryCreated.emit();
                this.processing = false;

                // reload parent category list
                this.reloadParentCategoriesList();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editCategory(catObj: CategoryDetailsViewModel) {
        // if changes were made to staff information then update staff
        if (this.OriginalCategory !== JSON.stringify(catObj)) {
            this.staffProductsService.editCategory(catObj)
            .subscribe(

                // success
                () => {
                    // tell parent component to reload category list
                    this.categoryEdited.emit();
                    this.processing = false;
                    this.reloadParentCategoriesList();
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
    }

    delete() {
        // show remove modal if category can de deleted
        if (this.Category.candelete === undefined || this.Category.candelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Category',
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
                title: 'Category In Use',
                message: 'This category cannot be deleted because it is being used by a product or as a parent category.',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffProductsService.deleteCategory(this.Category)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.categoryDeleted.emit();
                this.deleting = false;
                this.reloadParentCategoriesList();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }

    reloadParentCategoriesList() {
        if (this.staffProductsService.ParentCategoriesList) {
            this.staffProductsService.getPotentialParentCategoriesList().subscribe(
                // success
                reuslt => {
                    this.staffProductsService.ParentCategoriesList = reuslt;
                },

                // error
                error => {}
            );
        }
        this.reloadCategoriesListUsedByOthers();
    }

    reloadCategoriesListUsedByOthers() {
        if (this.staffProductsService.ProductCategoriesList) {
            this.staffProductsService.getCategoriesLiteList().subscribe(
                // success
                reuslt => {
                    this.staffProductsService.ProductCategoriesList = reuslt;
                },

                // error
                error => {}
            );
        }
    }

}
