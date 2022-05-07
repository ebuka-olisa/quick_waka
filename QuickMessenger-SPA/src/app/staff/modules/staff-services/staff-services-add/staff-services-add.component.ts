import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MultiplePicsComponent } from 'src/app/shared/components/multiple-pics/multiple-pics.component';
import { NgForm } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap';
import { NgbModalOptions, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceViewModel } from 'src/app/models/service';
import { StaffServicesService } from '../staff-services.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';

@Component({
    selector: 'app-staff-services-add',
    templateUrl: './staff-services-add.component.html',
    styleUrls: ['./staff-services-add.component.css']
})
export class StaffServicesAddComponent implements OnInit {

    @ViewChild(MultiplePicsComponent, {static: false})
    private multiplePicturesComponent: MultiplePicsComponent;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @ViewChild('myTabSet', {static: false})
    private myTabSet: TabsetComponent;

    @Input() initialState: any;

    @Output() serviceCreated = new EventEmitter<any>();
    @Output() serviceEdited = new EventEmitter<any>();
    @Output() serviceDeleted = new EventEmitter<any>();

    editServiceReady = true;
    Service: ServiceViewModel;
    OriginalService: string;

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
    servicePicturesConfig: any = {};

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private staffServicesService: StaffServicesService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.Service = new ServiceViewModel();
    }

    ngOnInit() {

        // if in edit mode
        if (this.initialState && this.initialState.Service) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.Service = JSON.parse(JSON.stringify(this.initialState.Service));

            // get more information from server
            this.getServiceForEdit();
        } else {
            // this.Service.deactivated = 'false';
            this.Service.generic = 'false';
            this.Service.pickupAllowed = 'true';
            this.Service.purchaseAllowed = 'true';
            this.Service.isDefaultGeneric = 'false';
            this.OriginalService = JSON.stringify(this.Service);
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


    // Service Operations
    getServiceForEdit() {
        this.editServiceReady = false;

        this.staffServicesService.getService(this.Service)
        .subscribe(
            // success
            response => {
                this.Service = response;
                this.Service.generic = this.Service.generic ? 'true' : 'false';
                this.Service.pickupAllowed = this.Service.pickupAllowed ? 'true' : 'false';
                this.Service.purchaseAllowed = this.Service.purchaseAllowed ? 'true' : 'false';
                this.Service.isDefaultGeneric = this.Service.isDefaultGeneric ? 'true' : 'false';

                // set deactivated status
                // this.Service.deactivated = this.Service.deactivated ? 'true' : 'false';

                // get copy of category to determine if change has been made
                this.OriginalService = JSON.stringify(this.Service);

                this.editServiceReady = true;

                // set parameters for profile picture component
                this.servicePicturesConfig = {
                    photos: this.editMode && this.Service.photos !== null ? this.Service.photos : null
                };
            },

            // error
            error => {
                this.notify.error('Problem loading service information, please reload page.');
                this.editServiceReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    purchaseStatusUpdated() {
        if (this.Service.purchaseAllowed === 'false' || this.Service.purchaseAllowed === false) {
            this.Service.generic = 'false';
            this.Service.isDefaultGeneric = 'false';
        }
    }

    universalStatusUpdated() {
        if (this.Service.generic === 'false' || this.Service.generic === false) {
            this.Service.isDefaultGeneric = 'false';
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
        const serviceInfoChanged = this.OriginalService !== JSON.stringify(this.Service);
        // const propertiesInfoChanged = this.OriginalExtraAttributes !== JSON.stringify(this.ExtraAttributes);
        return serviceInfoChanged || this.pictureChanges();
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
        let error = false;
        this.fieldErrors = {};

        if (this.Service.pickupAllowed === 'false' && this.Service.purchaseAllowed === 'false') {
            error = true;
            this.notify.error('You cannot disallow both purchase and pickup!');
        }


        if (!error) {
            this.processing = true;
            if (this.Pictures.length > 0) {

                // create new object to contain service information
                const serviceObj: ServiceViewModel = JSON.parse(JSON.stringify(this.Service));
                serviceObj.generic = this.Service.generic === 'true' ? true : false;
                serviceObj.pickupAllowed = this.Service.pickupAllowed === 'true' ? true : false;
                serviceObj.purchaseAllowed = this.Service.purchaseAllowed === 'true' ? true : false;
                serviceObj.isDefaultGeneric = this.Service.isDefaultGeneric === 'true' ? true : false;

                if (!this.editMode) {
                    // serviceObj.deactivated = false;
                    this.createNewService(serviceObj);
                } else {
                    this.editService(serviceObj);
                }
            } else {
                this.selectTab(1);
                setTimeout(() => {
                    this.multiplePicturesComponent.Error = 'Select pictures for this service';
                });
                this.processing = false;
            }
        }
    }

    createNewService(serviceObj: ServiceViewModel) {
        this.staffServicesService.createService(serviceObj)
        .subscribe(

            // success
            (response) => {
                // option 1
                // wait for service pictures to be uploaded
                this.uploadServicePhotos(response.id, this.Pictures, 0);
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

    editService(serviceObj: ServiceViewModel) {
        // if changes were made to staff information then update staff
        if (this.OriginalService !== JSON.stringify(serviceObj)) {
            this.staffServicesService.editService(serviceObj)
            .subscribe(

                // success
                (response) => {
                    // option 1
                    // wait for service pictures to be uploaded
                    this.uploadServicePhotos(serviceObj.id, this.Pictures, 0);
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
            // wait for service pictures to be uploaded
            this.uploadServicePhotos(serviceObj.id, this.Pictures, 0);
        }
    }


    // Delete & Deactivate
    delete() {
        // show remove modal if category can de deleted
        if (this.Service.canDelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Service',
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
                title: 'Service In Use',
                message: 'This service cannot be deleted because it contains products.',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffServicesService.deleteService(this.Service.id)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.serviceDeleted.emit();
                this.deleting = false;
                this.reloadServiceListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }

    reloadServiceListUsedByOthers() {
        /*if (this.staffProductsService.ProductServicesList) {
            this.staffProductsService.getServicesList()
            .subscribe(
                // success
                response => {
                    this.staffProductsService.ProductServicesList = response;
                },

                // error
                error => {}
            );
        }*/
    }


    // Picture
    setPictures(pics) {
        this.Pictures = pics;
    }

    deletePicture(photoId: number) {
        this.Service.photos.find(x => x.id === photoId).deleted = true;
    }

    uploadServicePhotos(serviceId: number, pictures, pictureIndex: number) {
        if (!pictures[pictureIndex].photoId) {
            this.staffServicesService.uploadServicePhoto(serviceId, pictures[pictureIndex])
                .subscribe(

                    // success
                    () => {
                        this.completePictureUpload(serviceId, pictures, pictureIndex);
                    },

                    // error
                    error => {
                        this.completeServiceSaveWithPictureError();
                        /*const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                        this.fieldErrors = allErrors.fieldErrors;
                        this.processing = false;*/
                    }
                );
        } else {
            this.completePictureUpload(serviceId, pictures, pictureIndex);
        }
    }

    completePictureUpload(serviceId, pictures, pictureIndex: number) {
        if (pictureIndex === (pictures.length - 1)) {
            // tell parent component to reload service list
            if (!this.editMode) {
                this.serviceCreated.emit();
            } else {
                this.serviceEdited.emit();
            }
            this.processing = false;
        } else {
            this.uploadServicePhotos(serviceId, pictures, pictureIndex + 1);
        }
        this.reloadServiceListUsedByOthers();
    }

    completeServiceSaveWithPictureError() {
        // tell parent component to reload service list
        if (!this.editMode) {
            this.serviceCreated.emit();
        } else {
            this.notify.success('Service was updated successfully');
        }
        this.processing = false;
        this.notify.error('Some pictures could not be uploaded!');
    }

}
