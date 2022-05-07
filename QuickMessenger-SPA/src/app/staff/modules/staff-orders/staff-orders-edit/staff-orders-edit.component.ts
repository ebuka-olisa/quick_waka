import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { OrderUpdateViewModel } from './../../../../models/order';
import { SharedService } from 'src/app/services/shared.service';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { StaffOrdersService } from './../staff-orders.service';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrderViewModel, ProductOrder } from 'src/app/models/order';
import { NotificationService } from 'src/app/services/notification.service';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { StatusOption } from 'src/app/models/product';
import { RiderLiteViewModel } from 'src/app/models/staff';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
    selector: 'app-staff-orders-edit',
    templateUrl: './staff-orders-edit.component.html',
    styleUrls: ['./staff-orders-edit.component.css']
})
export class StaffOrdersEditComponent implements OnInit {

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @Input() initialState: any;
    @Output() orderEdited = new EventEmitter<any>();

    editOrderReady = true;
    Order: OrderViewModel;
    OriginalOrder: string;

    ridersReady = true;
    Riders: RiderLiteViewModel[];
    riderSelectizeConfig = {
        labelField: 'firstName',
        valueField: 'id',
        searchField: ['lastname', 'firstName'],
        maxItems: 1,
        maxOptions: 10,
        highlight: true,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) { // selection
                const imageString = ''; /*item.imageUrl != null ? '<img src="' + escape(item.imageUrl) + '" />'
                    : '<span class="img-holder">' + escape(item.name.charAt(0)) + '</span></td>';*/
                let buildString = ''; // '<div><span class="opacity-5 font-12">' + escape(item.address) + '</span></div>';
                buildString = '<div>' + imageString + '<span class="font-14 display-inline-block">'
                    + escape(item.firstName + ' ' + item.lastname) + buildString + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                const imageString = ''; /*item.imageUrl != null ? '<img src="' + escape(item.imageUrl) + '" />'
                    : '<span class="img-holder">' + escape(item.name.charAt(0)) + '</span></td>';*/
                let buildString = ''; // '<div><span class="opacity-5 font-12">' + escape(item.address) + '</span></div>';
                buildString = '<div>' + imageString + '<span class="font-14">'
                    + escape(item.firstName + ' ' + item.lastname) + buildString + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    fieldErrors: any = {};
    processing: boolean;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    StateOptions: StatusOption[] = [];
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

    constructor(private staffOrdersService: StaffOrdersService,
                private notify: NotificationService,
                private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private validationErrorService: ValidationErrorService,
                sharedService: SharedService) {

        this.Order = new OrderViewModel();
        this.StateOptions = sharedService.OrderStateOptions;
     }

    ngOnInit() {

        // load riders
        this.loadRiders();

        // if in edit mode
        if (this.initialState && this.initialState.Order) {
            // clone original object so that changes do not reflect on the list view
            this.Order = JSON.parse(JSON.stringify(this.initialState.Order));

            // get more information from server
            this.getOrderForEdit();
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
                    this.activeModal.close();
                }
            );
        }
    }


    // Changes
    changesMade() {
        const orderInfoChanged = this.OriginalOrder !== JSON.stringify(this.Order);
        return orderInfoChanged;
    }


    // Rider Operations
    loadRiders() {
        this.ridersReady = false;

        if (!this.staffOrdersService.OrderRidersList) {
            this.staffOrdersService.getRidersList()
            .subscribe(
                // success
                response => {
                    this.completeLoadRiders(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading riders list, please reload page.');
                }
            );
        } else {
            this.completeLoadRiders(this.staffOrdersService.OrderRidersList);
        }

        // this.completeLoadVendors(this.tempVendors);
    }

    completeLoadRiders(list: RiderLiteViewModel[]) {
        this.Riders = list;
        this.staffOrdersService.OrderRidersList = this.Riders;
        this.ridersReady = true;

        // Get product vendor
        if (this.editOrderReady && this.Order.rider) {
            this.Order.riderId = this.Order.rider.id; // .toString();
            this.Order.rider = null;

            // get copy of product to determine if change has been made
            this.OriginalOrder = JSON.stringify(this.Order);
        }
    }

    riderChanged() {
        const x = Number(this.Order.riderId);
        if (x !== 0 && !isNaN(x)) {
            this.Order.riderId = x;
        }
    }


    // Product Operations
    getAmount(product: ProductOrder) {
        return product.productPrice * product.quantity;
    }

    getTotalAmount() {
        let total = 0;
        this.Order.productOrders.forEach((prod: ProductOrder) => {
            total += prod.productPrice * prod.quantity;
        });
        return total;
    }


    // Order Operations
    getOrderForEdit() {
        this.editOrderReady = false;

        this.staffOrdersService.getOrder(this.Order)
        .subscribe(
            // success
            response => {
                this.Order = response;

                // Get product vendor
                if (this.ridersReady && this.Order.rider) {
                    this.Order.riderId = this.Order.rider.id;
                    this.Order.rider = null;
                } else {
                    this.Order.riderId = null;
                }

                // set deactivated status
                // this.Product.deactivated = this.Product.deactivated ? 'true' : 'false';

                // get copy of category to determine if change has been made
                this.OriginalOrder = JSON.stringify(this.Order);

                this.editOrderReady = true;

                // set parameters for profile picture component
                /*this.productPicturesConfig = {
                    photos: this.editMode && this.Product.photos !== null ? this.Product.photos : null
                };*/
            },

            // error
            error => {
                this.notify.error('Problem loading order information, please reload page.');
                this.editOrderReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create update object
        const updateOrder: OrderUpdateViewModel = new OrderUpdateViewModel();
        updateOrder.id = this.Order.id;
        updateOrder.state = this.Order.state;
        const riderId = Number(this.Order.riderId);
        if (riderId === 0) {
            updateOrder.riderId = null;
        } else {
            updateOrder.riderId = this.Order.riderId;
        }

        this.staffOrdersService.editOrder(updateOrder)
            .subscribe(

                // success
                (response) => {
                    // tell parent component to reload staff list
                    this.orderEdited.emit();
                    this.processing = false;
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    /*if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }*/
                    this.processing = false;
                }
            );
    }

}
