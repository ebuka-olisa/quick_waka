import { ServiceListViewModel } from 'src/app/models/service';
import { SharedService } from 'src/app/services/shared.service';
import { ProductProperty, StatusOption } from './../../../../models/product';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ProductViewModel } from 'src/app/models/product';
import { NgbModalOptions, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryDetailsViewModel, Property } from 'src/app/models/category';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { StaffProductsService } from '../staff-products.service';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { NgForm } from '@angular/forms';
import { ProductExtraAttributesViewModel } from 'src/app/models/extra-attributes';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { VendorLiteViewModel } from 'src/app/models/vendor';
import { MultiplePicsComponent } from 'src/app/shared/components/multiple-pics/multiple-pics.component';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
    selector: 'app-staff-products-add',
    templateUrl: './staff-products-add.component.html',
    styleUrls: ['./staff-products-add.component.css']
})
export class StaffProductsAddComponent implements OnInit {

    @ViewChild(MultiplePicsComponent, {static: false})
    private multiplePicturesComponent: MultiplePicsComponent;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @ViewChild('myTabSet', {static: false})
    private myTabSet: TabsetComponent;

    @Input() initialState: any;

    @Output() productCreated = new EventEmitter<any>();
    @Output() productCreated2 = new EventEmitter<any>();
    @Output() productEdited = new EventEmitter<any>();
    @Output() productDeleted = new EventEmitter<any>();

    editProductReady = true;
    Product: ProductViewModel;
    OriginalProduct: string;

    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;
    deactivating: boolean;
    editMode: boolean;

    activeTab = 0;

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
    categorySelectizeConfig = {
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

    vendorsReady = false;
    Vendors: VendorLiteViewModel[];
    vendorSelectizeConfig = {
        labelField: 'name',
        valueField: 'id',
        searchField: 'name',
        maxItems: 1,
        maxOptions: 10,
        highlight: true,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) { // selection
                const imageString = item.imageUrl != null ? '<img src="' + escape(item.imageUrl) + '" />'
                    : '<span class="img-holder">' + escape(item.name.charAt(0)) + '</span></td>';
                let buildString = '<div><span class="opacity-5 font-12">' + escape(item.address) + '</span></div>';
                buildString = '<div>' + imageString + '<span class="font-14 display-inline-block">'
                    + escape(item.name) + buildString + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                const imageString = item.imageUrl != null ? '<img src="' + escape(item.imageUrl) + '" />'
                    : '<span class="img-holder">' + escape(item.name.charAt(0)) + '</span></td>';
                let buildString = '<div><span class="opacity-5 font-12">' + escape(item.address) + '</span></div>';
                buildString = '<div>' + imageString + '<span class="font-14">' + escape(item.name) + buildString + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    servicesReady = false;
    Services: ServiceListViewModel[];
    serviceSelectizeConfig = {
        labelField: 'name',
        valueField: 'id',
        searchField: 'name',
        maxItems: 1,
        maxOptions: 10,
        highlight: true,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) { // selection
                const buildString = '<div><span class="font-14 display-inline-block">'
                    + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                const buildString = '<div><span class="font-14 display-inline-block">'
                    + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };


    StatusOptions: StatusOption[] = [];
    statusSelectizeConfig = {
        labelField: 'name',
        valueField: 'value',
        searchField: 'name',
        maxItems: 1,
        highlight: false,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) { // selection
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    AvailabilityOptions: StatusOption[] = [];

    ExtraAttributes: ProductExtraAttributesViewModel[] = [];
    OriginalExtraAttributes: string;

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

    Pictures = [];
    productPicturesConfig: any = {};

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                sharedService: SharedService,
                private staffProductsService: StaffProductsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.Product = new ProductViewModel();
        this.StatusOptions = sharedService.StatusOptions;
        this.AvailabilityOptions = sharedService.AvailabilityOptions;
    }

    ngOnInit() {
        // load categories
        this.loadCategories();

        // load vendors
        this.loadVendors();

        // load services
        this.loadServices();

        // if in edit mode
        if (this.initialState && this.initialState.Product) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.Product = JSON.parse(JSON.stringify(this.initialState.Product));

            // get more information from server
            this.getProductForEdit();
        } else {
            this.Product.deactivated = 'false';
            this.Product.outOfStock = 'false';
            this.OriginalProduct = JSON.stringify(this.Product);
            this.OriginalExtraAttributes = JSON.stringify(this.ExtraAttributes);
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


    // Product Operations
    getProductForEdit() {
        this.editProductReady = false;

        this.staffProductsService.getProduct(this.Product)
        .subscribe(
            // success
            response => {
                this.Product = response;

                // Get product category
                if (this.categoriesReady) {
                    this.Product.prod_Category = null;
                } else if (!this.categoriesReady || !this.Product.prod_Category) {
                    this.Product.prod_CategoryId = null;
                }

                // Get product vendor
                if (this.vendorsReady) {
                    this.Product.vendor = null;
                } else if (!this.vendorsReady || !this.Product.vendor) {
                    this.Product.vendorId = null;
                }

                // Get service
                if (this.servicesReady) {
                    this.Product.service = null;
                } else if (!this.servicesReady || !this.Product.service) {
                    this.Product.serviceId = null;
                }

                // set deactivated status
                this.Product.deactivated = this.Product.deactivated ? 'true' : 'false';
                this.Product.outOfStock = this.Product.outOfStock ? 'true' : 'false';

                // get copy of category to determine if change has been made
                this.OriginalProduct = JSON.stringify(this.Product);

                this.editProductReady = true;

                // set parameters for profile picture component
                this.productPicturesConfig = {
                    photos: this.editMode && this.Product.photos !== null ? this.Product.photos : null
                };
            },

            // error
            error => {
                this.notify.error('Problem loading product information, please reload page.');
                this.editProductReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Description Operations
    descriptionReady() {
        this.descriptionTextAreaReady = true;
    }


    // Category Operations
    loadCategories() {
        this.categoriesReady = false;

        if (!this.staffProductsService.ProductCategoriesList) {
            this.staffProductsService.getCategoriesLiteList()
            .subscribe(
                // success
                response => {
                    this.completeLoadCategories(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading category list, please reload page.');
                }
            );
        } else {
            this.completeLoadCategories(this.staffProductsService.ProductCategoriesList);
        }

        // this.completeLoad(this.tempCategories);
    }

    completeLoadCategories(list: CategoryDetailsViewModel[]) {
        this.Categories = list;
        this.staffProductsService.ProductCategoriesList = this.Categories;
        this.categoriesReady = true;

        // Get product category
        if (this.editMode && this.editProductReady && this.Product.prod_Category) {
            this.Product.prod_CategoryId = this.Product.prod_Category.id;
            this.Product.prod_Category = null;

            // get copy of category to determine if change has been made
            this.OriginalProduct = JSON.stringify(this.Product);
        }
    }


    // Vendor Operations
    loadVendors() {
        this.vendorsReady = false;

        // if (!this.staffProductsService.ProductVendorsList) {
        this.staffProductsService.getVendorsList()
        .subscribe(
            // success
            response => {
                this.completeLoadVendors(response);
            },

            // error
            error => {
                this.notify.error('Problem loading vendor list, please reload page.');
            }
        );
        /*} else {
            this.completeLoadVendors(this.staffProductsService.ProductVendorsList);
        }*/

        // this.completeLoadVendors(this.tempVendors);
    }

    completeLoadVendors(list: VendorLiteViewModel[]) {
        this.Vendors = list;
        this.staffProductsService.ProductVendorsList = this.Vendors;
        this.vendorsReady = true;

        // Get product vendor
        if (this.editMode && this.editProductReady && this.Product.vendor) {
            this.Product.vendorId = this.Product.vendor.id; // .toString();
            this.Product.vendor = null;

            // get copy of product to determine if change has been made
            this.OriginalProduct = JSON.stringify(this.Product);
        }
    }

    vendorChanged() {
        const x = Number(this.Product.vendorId);
        if (x !== 0 && !isNaN(x)) {
            this.Product.vendorId = x;
        }
    }


    // Service Operations
    loadServices() {
        this.servicesReady = false;

        if (!this.staffProductsService.ProductServicesList) {
            this.staffProductsService.getServicesList()
            .subscribe(
                // success
                response => {
                    this.completeLoadServices(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading service list, please reload page.');
                }
            );
        } else {
            this.completeLoadServices(this.staffProductsService.ProductServicesList);
        }

        // this.completeLoad(this.tempCategories);
    }

    completeLoadServices(list: ServiceListViewModel[]) {
        this.Services = list;
        this.staffProductsService.ProductServicesList = this.Services;
        this.servicesReady = true;

        // Get product category
        if (this.editMode && this.editProductReady && this.Product.service) {
            this.Product.serviceId = this.Product.service.id;
            this.Product.service = null;

            // get copy of category to determine if change has been made
            this.OriginalProduct = JSON.stringify(this.Product);
        }
    }

    serviceChanged() {
        const x = Number(this.Product.serviceId);
        if (x !== 0 && !isNaN(x)) {
            this.Product.serviceId = x;
        }
    }


    // Extra Attribute Operations
    getExtraAttributes() {
        const x = Number(this.Product.prod_CategoryId);
        if (x === 0 || isNaN(x)) {
            this.ExtraAttributes = [];
        } else {
            this.Product.prod_CategoryId = x;
            if (!this.staffProductsService.LastProductCategorySelection
                || this.staffProductsService.LastProductCategorySelection !== this.Product.prod_CategoryId) {
                this.staffProductsService.getCategoryProperties(this.Product.prod_CategoryId)
                .subscribe(
                    // success
                    response => {
                        this.completePropertyLoad(response);
                    },

                    // error
                    error => {
                        this.notify.error('Problem loading extra attributes, please reload page.');
                    }
                );
            } else {
                this.completePropertyLoad(this.staffProductsService.CategorySelectionPropertyList);
            }
        }
    }

    completePropertyLoad(list: Property[]) {
        // extract extra attributes
        // if (this.staffProductsService.LastProductCategorySelection !== this.Product.categoryId) {
        this.ExtraAttributes = [];
        for (const property of list) {
            const existingAttribute: ProductExtraAttributesViewModel =
                this.ExtraAttributes.find(x => x.id === property.prod_PropertyTypeId);
            let savedProperty: ProductProperty;
            if (this.editMode) {
                savedProperty = this.Product.productProperties.find(x => x.propertyId === property.id);
            }
            if (!existingAttribute) {
                const properties: Property[] = [];
                properties.push({id: property.id,
                    measurementTypeSymbol: property.measurementTypeSymbol ? property.measurementTypeSymbol : 'None',
                    prod_PropertyTypeId: property.prod_PropertyTypeId, propertyTypeName: '', canDelete: false});
                const newExtraAttribute = {id: property.prod_PropertyTypeId, name : property.propertyTypeName, properties,
                    selectedProperty: !property.measurementTypeSymbol ? property.id : null, value: null};
                if (savedProperty) {
                    newExtraAttribute.value = savedProperty.value;
                    newExtraAttribute.selectedProperty = savedProperty.propertyId;
                }
                this.ExtraAttributes.push(newExtraAttribute);
            } else {
                existingAttribute.properties.push({id: property.id,
                    measurementTypeSymbol: property.measurementTypeSymbol ? property.measurementTypeSymbol : 'None',
                    prod_PropertyTypeId: property.prod_PropertyTypeId, propertyTypeName: '', canDelete: false});
                existingAttribute.selectedProperty = !property.measurementTypeSymbol ? property.id : existingAttribute.selectedProperty;
                if (savedProperty) {
                    existingAttribute.value = savedProperty.value;
                    existingAttribute.selectedProperty = savedProperty.propertyId;
                }
            }
        }
        // }

        this.staffProductsService.CategorySelectionPropertyList = list;
        this.staffProductsService.LastProductCategorySelection = this.Product.prod_CategoryId;
        this.OriginalExtraAttributes = JSON.stringify(this.ExtraAttributes);
        // this.extraAttributesReady = true;

        // this.assignCopy();
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/
        const productInfoChanged = this.OriginalProduct !== JSON.stringify(this.Product);
        const propertiesInfoChanged = this.OriginalExtraAttributes !== JSON.stringify(this.ExtraAttributes);
        return productInfoChanged || propertiesInfoChanged || this.pictureChanges();
    }

    pictureChanges() {
        let changes = false;
        for (const pic of this.Pictures) {
            if (!pic.photoId) {
                changes = true;
                break;
            }
        }
        return changes;
    }


    // Tabs
    selectTab(tabIndex: number) {
        this.myTabSet.tabs[tabIndex].active = true;
    }

    tabSelected(tabIndex) {
        this.activeTab = tabIndex;
    }

    goToNextTab() {
        const isFirstTab = this.activeTab === 0;
        return isFirstTab;
    }

    goToPreviousTab() {
        const isSecondTab = this.activeTab === 1;
        return isSecondTab;
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain product information
        const productObj: ProductViewModel = JSON.parse(JSON.stringify(this.Product));

        if (this.Pictures.length > 0) {

            // get vendor information
            const vendorId = Number(productObj.vendorId);
            if (vendorId === 0) {
                productObj.vendorId = null;
            }

            // set deactivation status
            if (productObj.deactivated === 'false') {
                productObj.deactivated = false;
            } else {
                productObj.deactivated = true;
            }

            if (!this.editMode) {
                productObj.deactivated = false;
                this.createNewProduct(productObj);
            } else {
                this.editProduct(productObj);
            }
        } else {
            this.selectTab(1);
            setTimeout(() => {
                this.multiplePicturesComponent.Error = 'Select pictures for this product';
            });
            this.processing = false;
        }
    }

    createNewProduct(productObj: ProductViewModel) {
        // get properties
        productObj.productProperties = [];
        for (const attr of this.ExtraAttributes) {
            if (attr.value && attr.value.trim() !== '') {
                productObj.productProperties.push(
                    {
                        propertyId : attr.selectedProperty,
                        productId: 0,
                        value: attr.value,
                        deleted: false,
                        propertyTypeName: attr.name,
                        measurementTypeSymbol: ''
                    }
                );
            }
        }

        this.staffProductsService.createProduct(productObj)
        .subscribe(

            // success
            (response) => {
                // option 1
                // wait for product pictures to be uploaded
                this.uploadProductPhotos(response.id, this.Pictures, 0);
            },

            // error
            error => {
                this.selectTab(0);
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editProduct(productObj: ProductViewModel) {
        // get properties
        const extraAttr: ProductExtraAttributesViewModel[] = JSON.parse(JSON.stringify(this.ExtraAttributes));
        for (const prop of productObj.productProperties) {
            let found = false;
            for (let i = extraAttr.length - 1; i >= 0; i--) {
                const currentAttr = extraAttr[i];
                if (prop.propertyId === currentAttr.selectedProperty) {
                    if (currentAttr.value && currentAttr.value.trim() !== '') {
                        found = true;
                        prop.value = currentAttr.value;
                        extraAttr.splice(i, 1);
                        break;
                    }
                }
            }
            if (!found) {
                prop.deleted = true;
            }
        }
        for (const attr of extraAttr) {
            if (attr.value && attr.value.trim() !== '') {
                productObj.productProperties.push(
                    {
                        propertyId : attr.selectedProperty,
                        productId: 0,
                        value: attr.value,
                        deleted: false,
                        propertyTypeName: attr.name,
                        measurementTypeSymbol: ''
                    }
                );
            }
        }

        // if changes were made to staff information then update staff
        if (this.OriginalProduct !== JSON.stringify(productObj)) {
            this.staffProductsService.editProduct(productObj)
            .subscribe(

                // success
                (response) => {
                    // option 1
                    // wait for product pictures to be uploaded
                    this.uploadProductPhotos(productObj.id, this.Pictures, 0);
                },

                // error
                error => {
                    this.selectTab(0);
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        } else {
            // attempt uploading pictures
            // wait for product pictures to be uploaded
            this.uploadProductPhotos(productObj.id, this.Pictures, 0);
        }
    }


    // Delete & Deactivate
    delete() {
        // show remove modal if category can de deleted
        if (this.Product.canDelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Product',
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
                title: 'Product In Use',
                message: 'This product cannot be deleted because it contains orders made by clients which cannot be deleted.',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffProductsService.deleteProduct(this.Product)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.productDeleted.emit();
                this.deleting = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }


    // Picture
    setPictures(pics) {
        this.Pictures = pics;
    }

    deletePicture(photoId: number) {
        this.Product.photos.find(x => x.id === photoId).deleted = true;
    }

    uploadProductPhotos(productId: number, pictures, pictureIndex: number) {
        if (!pictures[pictureIndex].photoId) {
            this.staffProductsService.uploadProductPhoto(productId, pictures[pictureIndex])
                .subscribe(

                    // success
                    () => {
                        this.completePictureUpload(productId, pictures, pictureIndex);
                    },

                    // error
                    error => {
                        this.completeProductSaveWithPictureError();
                        /*const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                        this.fieldErrors = allErrors.fieldErrors;
                        this.processing = false;*/
                    }
                );
        } else {
            this.completePictureUpload(productId, pictures, pictureIndex);
        }
    }

    completePictureUpload(productId, pictures, pictureIndex: number) {
        if (pictureIndex === (pictures.length - 1)) {
            // tell parent component to reload product list
            if (!this.editMode) {
                this.productCreated.emit();
            } else {
                this.productEdited.emit();
            }
            this.processing = false;
        } else {
            this.uploadProductPhotos(productId, pictures, pictureIndex + 1);
        }
    }

    completeProductSaveWithPictureError() {
        // tell parent component to reload product list
        if (!this.editMode) {
            this.productCreated.emit();
        } else {
            this.notify.success('Product was updated successfully');
        }
        this.processing = false;
        this.notify.error('Some pictures could not be uploaded!');
    }
}
