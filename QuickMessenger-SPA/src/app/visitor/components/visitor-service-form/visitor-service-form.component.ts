import { VisitorCartService } from './../../services/visitor-cart.service';
import { CartProductViewModel, ProductListViewModel } from './../../../models/product';
import { AuthService } from './../../../services/auth.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/services/notification.service';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DeliveryAddress } from 'src/app/models/address';
import { Ng2TelInput } from 'ng2-tel-input';
import { ActivatedRoute } from '@angular/router';
import { ServiceForm, PickupItem, ServiceViewModel } from 'src/app/models/service';
import { VisitorUserService } from '../../services/visitor-user.service';
import { VisitorAddressBookComponent } from '../address/visitor-address-book/visitor-address-book.component';
import { DatetimePopupComponent } from 'ngx-bootstrap-datetime-popup';
import * as $ from 'jquery';
import { VisitorProductService } from '../../services/visitor-product.service';
import { VisitorPurchaseItemsListComponent } from '../visitor-purchase-items-list/visitor-purchase-items-list.component';
import { VisitorProductAddedComponent } from '../visitor-product-added/visitor-product-added.component';
import { VisitorProductItemComponent } from '../visitor-product-item/visitor-product-item.component';

@Component({
    selector: 'app-visitor-service-form',
    templateUrl: './visitor-service-form.component.html',
    styleUrls: ['./visitor-service-form.component.css']
})
export class VisitorServiceFormComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;
    @ViewChild(DatetimePopupComponent, {static: false}) dateTimePopup: DatetimePopupComponent;

    Service: ServiceViewModel;
    ServiceNameId: string;
    ServiceForm: ServiceForm;
    Items: PickupItem[];
    Pictures = [];
    itemPicturesConfig: any = { maxFiles : 3};

    DefaultDeliveryAddress: DeliveryAddress;
    Addresses: DeliveryAddress[];
    PickupAllowed = true;
    PurchaseAllowed = true;

    fieldErrors: any = {};
    processing = false;

    TempPhone: string;
    TempPhone2: string;

    currentDialog;
    showFullTransparentLoadingIndicator = false;
    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };
    private productModalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: true
        // backdrop: 'static'
    };
    private purcahseModalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static',
        windowClass: 'full-modal'
    };
    private successModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: true
    };

    datetimePickerConfig = {
        showPicker: false,
        showMeridian: true,
        minDate: new Date(),
        minuteStep: 1
    };

    constructor(private title: Title,
                private authService: AuthService,
                private userService: VisitorUserService,
                private productService: VisitorProductService,
                private cartService: VisitorCartService,
                private notify: NotificationService,
                private modalService: NgbModal,
                private actRoute: ActivatedRoute) {

        this.Service = new ServiceViewModel();
    }

    ngOnInit() {

        this.actRoute.data.subscribe(data => {

            // reset form
            this.ServiceForm = new ServiceForm();
            this.ServiceForm.isPickup = 'true';
            this.ServiceForm.pickupItem = new PickupItem();
            this.ServiceForm.pickupItem.isFragile = 'false';
            this.ServiceForm.pickupItem.size = 'small';

            this.Service = data.items.serviceInfo;
            this.PickupAllowed = this.Service.pickupAllowed === 'true' || this.Service.pickupAllowed === true;
            this.PurchaseAllowed = this.Service.purchaseAllowed === 'true' || this.Service.purchaseAllowed === true;
            if (!this.PickupAllowed) {
                this.ServiceForm.isPickup = 'false';
            }

            this.Addresses = data.items.addresses;
            this.setDefaultDeliveryAddress();

            this.title.setTitle(this.Service.name + ' | Quick Waka');

            window.scrollTo(0, 0);
        });

        this.actRoute.params.subscribe (params => {
            this.ServiceNameId = params.serviceId;
        });

    }

    ngAfterViewInit() {}

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }


    // Picture
    setPictures(pics) {
        this.Pictures = pics;
    }

    deletePicture(photoId: number) {
        // this.Item.photos.find(x => x.id === photoId).deleted = true;
    }


    // Purchase Items
    addPurchaseItems() {
        // show loading icon
        this.showFullTransparentLoadingIndicator = true;

        // get items of this service
        return this.productService.getProducts(this.ServiceNameId, {}, 1, 48).subscribe(
            // success
            productInfo => {
                this.productService.getTopLevelCategories(this.ServiceNameId).subscribe(
                    // success
                    response => {
                        // show address list
                        const initialState = {
                            ServiceNameId: this.ServiceNameId,
                            ItemsInfo: productInfo,
                            TopCategories: response,
                            SelectedProducts: this.ServiceForm.purchaseItems
                        };

                        // show modal
                        this.currentDialog = this.modalService.open(VisitorPurchaseItemsListComponent, this.purcahseModalConfig);
                        this.currentDialog.componentInstance.initialState = initialState;
                        this.currentDialog.componentInstance.itemsSelected.subscribe(
                            (items: CartProductViewModel[]) => {
                                if (this.ServiceForm.purchaseItems) {
                                    // remove no longer needed items
                                    for (let j = this.ServiceForm.purchaseItems.length - 1; j >= 0; j--) {
                                        if (!items.find(x => x.id === this.ServiceForm.purchaseItems[j].id)) {
                                            this.ServiceForm.purchaseItems.splice(j, 1);
                                        }
                                    }
                                }
                                // add new items
                                if (items && items.length > 0 && !this.ServiceForm.purchaseItems) {
                                    this.ServiceForm.purchaseItems = [];
                                }
                                for (let j = items.length - 1; j >= 0; j--) {
                                    if (!this.ServiceForm.purchaseItems.find(x => x.id === items[j].id)) {
                                        this.ServiceForm.purchaseItems.push(items[j]);
                                    }
                                }
                                this.currentDialog.close();
                            }
                        );

                        // loading has completed successfully
                        this.showFullTransparentLoadingIndicator = false;
                    },

                    // error
                    error => {
                        this.notify.error('Problem loading items, please try page.');
                        this.showFullTransparentLoadingIndicator = false;
                    }
                );
            },

            // error
            error => {
                this.notify.error('Problem loading items, please try page.');
                this.showFullTransparentLoadingIndicator = false;
            }
        );
    }

    decreaseQuantity(Item: CartProductViewModel) {
        if (isNaN(Item.quantity)) {
            Item.quantity = 1;
        }
        let newValue = Item.quantity - 1;
        if (newValue < 1) {
            newValue = 1;
        }
        Item.quantity = newValue;
    }

    increaseQuantity(Item: CartProductViewModel) {
        if (isNaN(Item.quantity)) {
            Item.quantity = 0;
        }
        let newValue = Item.quantity + 1;
        if (newValue < 1) {
            newValue = 1;
        }
        Item.quantity = newValue;
    }

    purchaseTotal() {
        let total = 0;
        for (const item of this.ServiceForm.purchaseItems) {
            total += item.price * item.quantity;
        }
        return total;
    }

    removePurcahseItem(index) {
        this.ServiceForm.purchaseItems.splice(index, 1);
        this.notify.info('Item was deleted');
    }

    showProduct(selectedProduct: ProductListViewModel) {
        // show loading icon
        this.showFullTransparentLoadingIndicator = true;

        // get product info
        this.productService.getProduct(selectedProduct.id).subscribe(
             // success
             result => {
                const initialState = {
                    Product: result,
                    ShowCartButtons: false
                };

                // show modal
                this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.productModalConfig);
                this.currentDialog.componentInstance.initialState = initialState;

                // hide loaidng icon
                this.showFullTransparentLoadingIndicator = false;
            },

            // error
            error => {this.notify.error('Problem loading product information, please try again.');}
        );
    }


    // Address
    selectPickupAddress() {
        // show loading icon
        this.showFullTransparentLoadingIndicator = true;

        // check if user is logged in
        const user = this.authService.getUser();
        if (user) {
            // get addresses of user
            return this.userService.getAddresses().subscribe(
                // success
                response => {

                    // show address list
                    const initialState = {
                        Addresses: response,
                        pickup: true,
                        SelectedAddressId: this.ServiceForm.pickupAddress ? this.ServiceForm.pickupAddress.id : null
                    };

                    // show modal
                    this.currentDialog = this.modalService.open(VisitorAddressBookComponent, this.modalConfig);
                    this.currentDialog.componentInstance.initialState = initialState;
                    this.currentDialog.componentInstance.selectedAddressUpdated.subscribe(
                        (address) => {
                            this.ServiceForm.pickupAddress = address;
                        }
                    );
                    this.currentDialog.componentInstance.addressSelected.subscribe(
                        (address) => {
                            if (this.ServiceForm.deliveryAddress && this.ServiceForm.deliveryAddress.id === address.id) {
                                this.notify.error('You cannot select the same address for pickup and delivery');
                            } else {
                                this.fieldErrors.PickupAddress = null;
                                this.ServiceForm.pickupAddress = address;
                                this.currentDialog.close();
                            }
                        }
                    );

                    // loading has completed successfully
                    this.showFullTransparentLoadingIndicator = false;
                },

                // error
                error => {
                    this.notify.error('Problem loading addresses, please reload page.');
                    this.showFullTransparentLoadingIndicator = false;
                }
            );
        } else {
            // open new tab to initiate login
            const channelName = 'pickup' + new Date().getTime();
            window.open('/account/signin?pre=imp&ch=' + channelName, '_blank');
            this.showFullTransparentLoadingIndicator = false;

            // wait for response from the sign in tab
            const channel = new BroadcastChannel(channelName);
            channel.onmessage = (e) => {
                if (e.data === 'success') {
                    this.selectPickupAddress();
                    channel.close();
                    setTimeout(() => {
                        $('#content-section').trigger('click');
                    }, 500);
                }
            };
        }

    }

    removePickupAddress() {
        this.ServiceForm.pickupAddress = null;
    }

    selectDeliveryAddress(setDefault?: boolean) {
        // show loading icon
        this.showFullTransparentLoadingIndicator = true;

        // check if user is logged in
        const user = this.authService.getUser();
        if (user) {
            // get addresses of user
            return this.userService.getAddresses().subscribe(
                // success
                response => {

                    if (setDefault) {
                        this.Addresses = response;
                        this.setDefaultDeliveryAddress();
                    }

                    // show address list
                    const initialState = {
                        Addresses: response,
                        SelectedAddressId: this.ServiceForm.deliveryAddress ? this.ServiceForm.deliveryAddress.id : null
                    };

                    // show modal
                    this.currentDialog = this.modalService.open(VisitorAddressBookComponent, this.modalConfig);
                    this.currentDialog.componentInstance.initialState = initialState;
                    this.currentDialog.componentInstance.selectedAddressUpdated.subscribe(
                        (address) => {
                            this.ServiceForm.deliveryAddress = address;
                        }
                    );
                    /*this.currentDialog.componentInstance.addressDeleted.subscribe(
                        () => {
                            this.ServiceForm.deliveryAddress = null;
                        }
                    );*/
                    this.currentDialog.componentInstance.addressSelected.subscribe(
                        (address) => {
                            if (this.ServiceForm.pickupAddress && this.ServiceForm.pickupAddress.id === address.id) {
                                this.notify.error('You cannot select the same address for pickup and delivery');
                            } else {
                                this.fieldErrors.DeliveryAddress = null;
                                this.ServiceForm.deliveryAddress = address;
                                this.currentDialog.close();
                            }
                        }
                    );

                    // loading has completed successfully
                    this.showFullTransparentLoadingIndicator = false;
                },

                // error
                error => {
                    this.notify.error('Problem loading addresses, please reload page.');
                    this.showFullTransparentLoadingIndicator = false;
                }
            );
        } else {
            // open new tab to initiate login
            const channelName = 'delivery' + new Date().getTime();
            window.open('/account/signin?pre=imp&ch=' + channelName, '_blank');
            this.showFullTransparentLoadingIndicator = false;

            // wait for response from the sign in tab
            const channel = new BroadcastChannel(channelName);
            channel.onmessage = (e) => {
                if (e.data === 'success') {
                    this.selectDeliveryAddress(true);
                    channel.close();
                    setTimeout(() => {
                        $('#content-section').trigger('click');
                    }, 500);
                }
            };
        }
    }

    removeDeliveryAddress() {
        this.ServiceForm.deliveryAddress = null;
    }

    setDefaultDeliveryAddress() {
        if (this.Addresses) {
            const defaultAddress = this.Addresses.find(x => x.defaultAdd === true);
            if (defaultAddress) {
                this.DefaultDeliveryAddress = defaultAddress;
                // for (const myServiceForm of this.ServiceForms) {
                this.ServiceForm.deliveryAddress = this.DefaultDeliveryAddress;
                // }
            }
        }
    }


    // Date Time
    toggleDateTimePopup() {
        this.datetimePickerConfig.showPicker = !this.datetimePickerConfig.showPicker;
    }

    onPickupDateValueChange(val: Date) {
        this.fieldErrors.PickupDate = null;
        if (this.isValidDate(val)) {
            if (this.isValidPickupDate(val)) {
                this.ServiceForm.pickupDate = val.toString();
            } else {
                this.ServiceForm.pickupDate = null;
            }
        } else {
            this.ServiceForm.pickupDate = null;
        }
    }

    isValidDate(date): boolean {
        // this function is only here to stop the datepipe from erroring if someone types in value
        return date && (typeof date !== 'string') && !isNaN(date.getTime());
    }

    isValidPickupDate(date: Date): boolean {
        let allowed = true;

        if (date) {
            const now = new Date();
            if (now.getSeconds() < 3) {
                now.setMinutes(now.getMinutes() - 1);
            }
            now.setSeconds(0);
            now.setMilliseconds(0);

            const fiveAm = new Date();
            fiveAm.setFullYear(date.getFullYear());
            fiveAm.setMonth(date.getMonth());
            fiveAm.setDate(date.getDate());
            fiveAm.setHours(5);
            fiveAm.setMinutes(0);
            fiveAm.setSeconds(0);

            if (date.getHours() === 5 && date.getMinutes() === 0) {
                date = fiveAm;
            }

            const sixPm = new Date();
            sixPm.setFullYear(date.getFullYear());
            sixPm.setMonth(date.getMonth());
            sixPm.setDate(date.getDate());
            sixPm.setHours(23);
            sixPm.setMinutes(0);
            sixPm.setSeconds(0);

            // check if time is before 5:00 AM
            if (date < fiveAm) {
                allowed = false;
                this.notify.error('We do not pickup items before 5:00 AM');
            } else if (date > sixPm) { // check is time is past 11:00 PM
                allowed = false;
                this.notify.error('We do not pickup items after 11:00 PM');
            } else {
                if (now > date) {
                    allowed = false;
                    this.notify.error('You cannot select a previous date or a time that has passed');
                }
            }
        }

        return allowed;
    }


    placeOrder() {
        this.processing = true;
        this.fieldErrors = {};
        let error = false;

        // ----- VALIDATE FORM -----
        // check for delivery address
        if (!this.ServiceForm.deliveryAddress) {
            this.fieldErrors.DeliveryAddress = 'No delivery address has been selected';
            error = true;
        }

        // validate pickup order
        if (this.ServiceForm.isPickup === 'true') {
            // validate pickup address
            if (!this.ServiceForm.pickupAddress) {
                this.fieldErrors.PickupAddress = 'No pickup address has been selected';
                error = true;
            }
            // validate pickup date
            if (!this.ServiceForm.pickupDate || isNaN(Date.parse(this.ServiceForm.pickupDate))) {
                this.fieldErrors.PickupDate = 'No pickup date has been selected';
                error = true;
            }
            // validate pickup item
            if (!this.ServiceForm.pickupItem.name || this.ServiceForm.pickupItem.name.trim() === '') {
                this.fieldErrors.ItemName = 'Enter a name for the item being picked up';
                error = true;
            }
            if (!this.ServiceForm.pickupItem.value || this.ServiceForm.pickupItem.value < 1) {
                this.fieldErrors.ItemValue = 'Enter the value of the item';
                error = true;
            }
            if (!this.ServiceForm.pickupItem.count || this.ServiceForm.pickupItem.count < 1) {
                this.fieldErrors.ItemCount = 'Enter the number of pieces to be picked up.';
                error = true;
            }
            if (this.ServiceForm.pickupItem.isFragile === undefined || this.ServiceForm.pickupItem.isFragile === null) {
                this.fieldErrors.ItemNature = 'Indicate whether the item to be picked up is fragile';
                error = true;
            }
            if (!this.ServiceForm.pickupItem.size || this.ServiceForm.pickupItem.size.trim() === '') {
                this.fieldErrors.ItemSize = 'Select the size of the item';
                error = true;
            }
            if (!this.ServiceForm.pickupItem.description || this.ServiceForm.pickupItem.description.trim() === '') {
                this.fieldErrors.ItemDescription = 'Write a short description of the item being picked up.';
                error = true;
            }
        } else { // validate purchase order
            if (!this.ServiceForm.purchaseItems || this.ServiceForm.purchaseItems.length < 1) {
                this.fieldErrors.PurchaseItems = 'Add items you want to purchase';
                error = true;
            }
        }

        if (error) {
            this.processing = false;
            this.notify.error('Please fill the form properly');
        } else {
            const done = this.cartService.addOrder(this.ServiceForm, this.Pictures, this.Service);

            // if successful, so pop-up
            if (done) {
                this.processing = false;
                this.currentDialog = this.modalService.open(VisitorProductAddedComponent, this.successModalConfig);
                this.currentDialog.componentInstance.initialState = {OrderAdded: true};
                this.currentDialog.componentInstance.closed.subscribe(
                    () => {
                        window.scrollTo(0, 0);
                    }
                );

                // reset page
                window.scrollTo(0, 0);
                this.ServiceForm = new ServiceForm();
                this.ServiceForm.isPickup = 'true';
                this.ServiceForm.pickupItem = new PickupItem();
                this.ServiceForm.pickupItem.isFragile = 'false';
                this.ServiceForm.pickupItem.size = 'small';
                if (!this.PickupAllowed) {
                    this.ServiceForm.isPickup = 'false';
                }
                this.setDefaultDeliveryAddress();
                this.Pictures = [];
            } else {
                this.processing = false;
                this.notify.error('Sorry, we could not place your order. Please try again');
            }
        }
    }
}
