import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ExtraAttributeDetailsViewModel } from 'src/app/models/extra-attributes';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { StaffProductsService } from '../staff-products.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-staff-products-extra-attributes-add',
    templateUrl: './staff-products-extra-attributes-add.component.html',
    styleUrls: ['./staff-products-extra-attributes-add.component.css']
})
export class StaffProductsExtraAttributesAddComponent implements OnInit {

    @ViewChild('myForm', {static: false})
    private myForm: NgForm;

    @Output() extraAttributeCreated = new EventEmitter<any>();
    @Output() extraAttributeEdited = new EventEmitter<any>();
    @Output() extraAttributeDeleted = new EventEmitter<any>();

    @Input() initialState: any;

    title: string;

    ExtraAttribute: ExtraAttributeDetailsViewModel;
    OriginalExtraAttribute: string;
    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;
    editMode: boolean;
    editExtraAttributeReady = true;

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

        this.ExtraAttribute = new ExtraAttributeDetailsViewModel();
    }

    ngOnInit() {
        // we are editing an exisiting value
        if (this.initialState && this.initialState.ExtraAttribute) {
            this.ExtraAttribute = JSON.parse(JSON.stringify(this.initialState.ExtraAttribute));
            this.editMode = true;

            // get extra attribute information from server
            this.getExtraAttributeForEdit();
        } else {
            this.completeExtraAttributeSetup();
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


    // Description Operations
    descriptionReady() {
        this.descriptionTextAreaReady = true;
    }


    // Extra Attribute Get, Create & Edit
    getExtraAttributeForEdit() {
        this.editExtraAttributeReady = false;

        this.staffProductsService.getExtraAttribute(this.ExtraAttribute)
        .subscribe(
            // success
            response => {
                this.ExtraAttribute = response;

                this.completeExtraAttributeSetup();

                this.editExtraAttributeReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading extra attribute information, please reload page.');
                this.editExtraAttributeReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    completeExtraAttributeSetup() {
        // get copy of extra attribute to determine if change has been made
        this.OriginalExtraAttribute = JSON.stringify(this.ExtraAttribute);
    }

    save() {
        this.processing = true;
        this.fieldErrors = {};

        if (!this.editMode) {
            this.createNewExtraAttribute();
        } else {
            this.editExtraAttribute();
        }
    }

    createNewExtraAttribute() {
        this.staffProductsService.createExtraAttribute(this.ExtraAttribute)
        .subscribe(

            // success
            () => {
                // tell parent component to reload list
                this.extraAttributeCreated.emit();
                this.processing = false;
                this.reloadExtraAttributesListUsedByOthers();
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

    editExtraAttribute() {
        const myExtraAttribute = this.ExtraAttribute;
        // myExtraAttribute.pictureRemoved = this.profilePictureComponent.pictureRemoved;

        this.staffProductsService.editExtraAttribute(myExtraAttribute)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                this.extraAttributeEdited.emit();
                this.processing = false;
                this.reloadExtraAttributesListUsedByOthers();
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
        // show remove modal if property can de deleted
        if (this.ExtraAttribute.candelete === undefined || this.ExtraAttribute.candelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Extra Attribute',
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
                title: 'Extra Attribute In Use',
                message: 'This extra atribute cannot be deleted because it is being used by a category or product.',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffProductsService.deleteExtraAttribute(this.ExtraAttribute)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload staff list
                this.extraAttributeDeleted.emit();
                this.deleting = false;
                this.reloadExtraAttributesListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }

    reloadExtraAttributesListUsedByOthers() {
        // upload ExtraAttributesList if created
        if (this.staffProductsService.ExtraAttributesList) {
            this.staffProductsService.getExtraAttributesFullList()
            .subscribe(
                // success
                response => {
                    this.staffProductsService.ExtraAttributesList = response;
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

        const attributeInfoChanged = this.OriginalExtraAttribute !== JSON.stringify(this.ExtraAttribute);
        return attributeInfoChanged;
    }
}
