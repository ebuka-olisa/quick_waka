import { CartCreateViewModel, CartCreateAdjustViewModel, CartAdjustServiceOrder } from './../../../../models/cart';
import { OrderAddressViewModel } from './../../../../models/order';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, NgZone, Renderer2 } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { Cart } from 'src/app/models/cart';
import { ServiceForm } from 'src/app/models/service';
import { DeliveryAddress } from 'src/app/models/address';
import { VisitorCartService } from 'src/app/visitor/services/visitor-cart.service';
import { VisitorOrderService } from 'src/app/visitor/services/visitor-order.service';
import { VisitorAddressBookComponent } from '../../address/visitor-address-book/visitor-address-book.component';
import { timer, Subscription } from 'rxjs';
import { Flutterwave, InlinePaymentOptions, PaymentSuccessResponse } from 'flutterwave-angular-v3';
import * as $ from 'jquery';

@Component({
    selector: 'app-visitor-checkout',
    templateUrl: './visitor-checkout.component.html',
    styleUrls: ['./visitor-checkout.component.css']
})
export class VisitorCheckoutComponent implements OnInit, OnDestroy {

    Cart: Cart;

    Addresses: DeliveryAddress[];
    HasAllAddresses = true;
    ShippingCost = 0;
    customer: any;

    showFullTransparentLoadingIndicator = false;
    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    datetimePickerConfig = {
        showPicker: false,
        showMeridian: true,
        minDate: new Date()
    };
    dateUpdateSubscription: Subscription;

    // payment
    options = {
        key: 'pk_test_bdeaa2d769c5e4d1a5449558ace8435fde52f369',
        amount: 50000,
        email: 'user@mail.com',
        ref: `${Math.ceil(Math.random() * 10e10)}`
    };

    paymentData: InlinePaymentOptions;

    constructor(title: Title,
                private cartService: VisitorCartService,
                private authService: AuthService,
                private userService: VisitorUserService,
                private orderService: VisitorOrderService,
                private notify: NotificationService,
                private modalService: NgbModal,
                private domSanitizer: DomSanitizer,
                private router: Router,
                private flutterwave: Flutterwave,
                private zone: NgZone,
                private renderer: Renderer2) {
        // set page title
        title.setTitle('Checkout | Quick Waka');
    }

    ngOnInit() {
        // get Cart
        this.Cart = this.cartService.getCart();

        // configure cart
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (order.isPickup) {
                    if (order.pickupDate) {
                        if (!order.pickupTempDate) {
                            order.pickupTempDate = new Date(order.pickupDate);
                        } else if (!(order.pickupTempDate instanceof Date)) {
                            order.pickupTempDate = new Date(order.pickupTempDate);
                        }
                    } else {
                        order.pickupTempDate = null;
                    }
                }
            }
        }

        // get user
        this.options.email = this.authService.getUser().email;

        // get service charge, if all address have been provided
        if (this.weHaveAllAddresses()) {
            this.getShippingCost();
        }

        // Flutterwave
        this.paymentData = {
            public_key: 'FLWPUBK_TEST-81295c527896f1efa1a3d0c62d7d82b8-X',
            tx_ref: '',
            amount: 10,
            currency: 'NGN',
            payment_options: 'card,ussd',
            redirect_url: '',
            // meta: this.meta,
            customer: {
                name: this.authService.getUser().fullName,
                email: this.authService.getUser().email
            },
            customizations: {
                title: 'QuickWaka',
                description: 'Have an errand? We go waka am for you',
                logo: 'https://res.cloudinary.com/victoragome/image/upload/v1589298621/qm/home/quick_waka_logo_2x_xrirrs.png'
            },
            callback: this.paymentCallback,
            onclose: this.paymentCancel,
            callbackContext: this
        };
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }


    // Address
    selectPickupAddress(Order: ServiceForm) {
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
                        SelectedAddressId: Order.pickupAddress ? Order.pickupAddress.id : null
                    };

                    // show modal
                    this.currentDialog = this.modalService.open(VisitorAddressBookComponent, this.modalConfig);
                    this.currentDialog.componentInstance.initialState = initialState;
                    this.currentDialog.componentInstance.selectedAddressUpdated.subscribe(
                        (address: DeliveryAddress) => {
                            // check if address was actually changed
                            let updateOnlineCart = false;
                            const addressChanged = this.addressChanged(Order.pickupAddress, address);
                            if (addressChanged && this.shouldUpdateOnlineCart(Order.pickupAddress, address)) {
                                updateOnlineCart = true;
                            }
                            if (addressChanged) {
                                Order.pickupAddress = address;
                                this.updateOthersUsingThisAddress(address);
                                this.cartService.updateCart(this.Cart, updateOnlineCart, false);
                                if (updateOnlineCart && this.weHaveAllAddresses()) {
                                    this.getShippingCost();
                                }
                            }
                        }
                    );
                    this.currentDialog.componentInstance.addressSelected.subscribe(
                        (address: DeliveryAddress) => {
                            if (Order.deliveryAddress && Order.deliveryAddress.id === address.id) {
                                this.notify.error('You cannot select the same address for pickup and delivery');
                            } else {
                                let addresChanged = true;
                                if (Order.pickupAddress && Order.pickupAddress.id === address.id) {
                                    addresChanged = false;
                                }
                                if (addresChanged) {
                                    Order.pickupAddress = address;
                                    this.cartService.updateCart(this.Cart, true, false);
                                    if (this.weHaveAllAddresses()) {
                                        this.getShippingCost();
                                    }
                                }
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
            const channelName = 'pickup_ckout_' + new Date().getTime();
            window.open('/account/signin?pre=imp&ch=' + channelName, '_blank');
            this.showFullTransparentLoadingIndicator = false;

            // wait for response from the sign in tab
            const channel = new BroadcastChannel(channelName);
            channel.onmessage = (e) => {
                if (e.data === 'success') {
                    this.selectPickupAddress(Order);
                    channel.close();
                    setTimeout(() => {
                        $('#content-section').trigger('click');
                    }, 500);
                }
            };
        }

    }

    selectDeliveryAddress(Order: ServiceForm, setDefault?: boolean) {
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
                        this.setDefaultDeliveryAddress(Order);
                        this.cartService.updateCart(this.Cart, true, false);
                    }

                    // show address list
                    const initialState = {
                        Addresses: response,
                        SelectedAddressId: Order.deliveryAddress ? Order.deliveryAddress.id : null
                    };

                    // show modal
                    this.currentDialog = this.modalService.open(VisitorAddressBookComponent, this.modalConfig);
                    this.currentDialog.componentInstance.initialState = initialState;
                    this.currentDialog.componentInstance.selectedAddressUpdated.subscribe(
                        (address: DeliveryAddress) => {
                            // check if address was actually changed
                            let updateOnlineCart = false;
                            const addressChanged = this.addressChanged(Order.deliveryAddress, address);
                            if (addressChanged && this.shouldUpdateOnlineCart(Order.deliveryAddress, address)) {
                                updateOnlineCart = true;
                            }
                            if (addressChanged) {
                                Order.deliveryAddress = address;
                                this.updateOthersUsingThisAddress(address);
                                this.cartService.updateCart(this.Cart, updateOnlineCart, false);
                                if (updateOnlineCart && this.weHaveAllAddresses()) {
                                    this.getShippingCost();
                                }
                            }
                        }
                    );
                    /*this.currentDialog.componentInstance.addressDeleted.subscribe(
                        () => {
                            this.clearOthersUsingThisAddress(Order.deliveryAddress.id);
                            Order.deliveryAddress = null;
                            this.cartService.updateCart(this.Cart, true, false);
                            this.HasAllAddresses = false;
                            this.ShippingCost = 0;
                        }
                    );*/
                    this.currentDialog.componentInstance.addressSelected.subscribe(
                        (address) => {
                            if (Order.pickupAddress && Order.pickupAddress.id === address.id) {
                                this.notify.error('You cannot select the same address for pickup and delivery');
                            } else {
                                let addresChanged = true;
                                if (Order.deliveryAddress && Order.deliveryAddress.id === address.id) {
                                    addresChanged = false;
                                }
                                if (addresChanged) {
                                    Order.deliveryAddress = address;
                                    this.cartService.updateCart(this.Cart, true, false);
                                    if (this.weHaveAllAddresses()) {
                                        this.getShippingCost();
                                    }
                                }
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
            const channelName = 'delivery_ckout_' + new Date().getTime();
            window.open('/account/signin?pre=imp&ch=' + channelName, '_blank');
            this.showFullTransparentLoadingIndicator = false;

            // wait for response from the sign in tab
            const channel = new BroadcastChannel(channelName);
            channel.onmessage = (e) => {
                if (e.data === 'success') {
                    this.selectDeliveryAddress(Order, true);
                    channel.close();
                    setTimeout(() => {
                        $('#content-section').trigger('click');
                    }, 500);
                }
            };
        }
    }

    addressChanged(oldAddress: DeliveryAddress, newAddress: DeliveryAddress) {
        let addressChanged = true;
        if (oldAddress && (oldAddress.lastName.trim() === newAddress.lastName.trim()
            && oldAddress.firstName.trim() === newAddress.firstName.trim() && oldAddress.phone.trim() === newAddress.phone.trim()
            && oldAddress.street.trim() === newAddress.street.trim() && oldAddress.city.trim() === newAddress.city.trim()
            && oldAddress.state.trim() === newAddress.state.trim() && oldAddress.country.trim() === newAddress.country.trim())) {
                addressChanged = false;
        }
        return addressChanged;
    }

    shouldUpdateOnlineCart(oldAddress: DeliveryAddress, newAddress: DeliveryAddress) {
        if (oldAddress.street.trim() !== newAddress.street.trim() || oldAddress.city.trim() !== newAddress.city.trim()
            || oldAddress.state.trim() !== newAddress.state.trim() || oldAddress.country.trim() !== newAddress.country.trim()) {
            return true;
        }
        return false;
    }

    setDefaultDeliveryAddress(Order: ServiceForm) {
        if (this.Addresses) {
            const defaultAddress = this.Addresses.find(x => x.defaultAdd === true);
            if (defaultAddress) {
                // this.DefaultDeliveryAddress = defaultAddress;
                // for (const myServiceForm of this.ServiceForms) {
                Order.deliveryAddress = defaultAddress; // this.DefaultDeliveryAddress;
                // }
            }
        }
    }

    updateOthersUsingThisAddress(address) {
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (!order.isPickup) {
                    if (order.deliveryAddress.id === address.id) {
                        order.deliveryAddress = address;
                    }
                } else {
                    if (order.pickupAddress.id === address.id) {
                        order.pickupAddress = address;
                    } else if (order.deliveryAddress.id === address.id) {
                        order.deliveryAddress = address;
                    }
                }
            }
        }
    }

    clearOthersUsingThisAddress(addressId) {
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (!order.isPickup) {
                    if (order.deliveryAddress.id === addressId) {
                        order.deliveryAddress = null;
                    }
                } else {
                    if (order.pickupAddress.id === addressId) {
                        order.pickupAddress = null;
                    }
                    if (order.deliveryAddress.id === addressId) {
                        order.deliveryAddress = null;
                    }
                }
            }
        }
    }

    weHaveAllAddresses() {
        let hasAllAddresses = true;
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (order.isPickup) {
                    if (!order.pickupAddress) {
                        hasAllAddresses = false;
                    }
                }
                if (!order.deliveryAddress ) {
                    hasAllAddresses = false;
                }
            }
        }
        return hasAllAddresses;
    }


    // Date Time
    toggleDateTimePopup() {
        this.datetimePickerConfig.showPicker = !this.datetimePickerConfig.showPicker;
    }

    onPickupDateValueChange(val: Date, Order: ServiceForm) {
        // this.fieldErrors.PickupDate = null;
        if (this.isValidDate(val)) {
            if (this.isValidPickupDate(val)) {
                Order.pickupDate = val.toString();
            } else {
                Order.pickupDate = null;
            }

            if (this.dateUpdateSubscription != null) {
                this.dateUpdateSubscription.unsubscribe();
            }

            const dateUpdateTimer  = timer(1000); // 2000 millisecond means 2 seconds
            this.dateUpdateSubscription = dateUpdateTimer.subscribe(() => {
                this.cartService.updateCart(this.Cart, true, false);
                this.dateUpdateSubscription = null;
            });
        } else {
            Order.pickupDate = null;
        }
    }

    isValidDate(date): boolean {
        // this function is only here to stop the datepipe from erroring if someone types in value
        return date && (typeof date !== 'string') && !isNaN(date.getTime());
    }

    isValidPickupDate(date: Date): boolean {
        let allowed = true;

        if (date) {
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
                const now = new Date();
                if (now > date) {
                    allowed = false;
                    this.notify.error('You cannot select a previous date or a time that has passed');
                }
            }
        }

        return allowed;
    }


    // Pickup
    allowImageURL(url: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }


    // Costing
    getShippingCost() {
        this.showFullTransparentLoadingIndicator = true;

        // collate address info
        const orderAddresses: OrderAddressViewModel[] = [];
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (!order.isPickup) {
                    const productIds = [];
                    for (const item of order.purchaseItems) {
                        productIds.push(item.id);
                    }
                    orderAddresses.push ({productIds, addressId: order.deliveryAddress.id, pickupAddressId: 0});
                } else {
                    orderAddresses.push({pickupAddressId: order.pickupAddress.id, addressId: order.deliveryAddress.id, productIds: null});
                }
            }
        }

        return this.orderService.getServiceCharge(orderAddresses).subscribe(
            // success
            response => {
                this.ShippingCost = response;
                this.options.amount = (this.cartTotal() + this.ShippingCost) * 100;

                // loading has completed successfully
                this.showFullTransparentLoadingIndicator = false;
            },

            // error
            error => {
                this.notify.error('Problem processing shipping cost, please reload page.');
                this.showFullTransparentLoadingIndicator = false;
            }
        );
    }

    cartTotal() {
        this.HasAllAddresses = true;
        let total = 0;
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (!order.isPickup) {
                    for (const item of order.purchaseItems) {
                        total += item.price * item.quantity;
                    }
                } else {
                    if (!order.pickupAddress) {
                        this.HasAllAddresses = false;
                    }
                }
                if (!order.deliveryAddress) {
                    this.HasAllAddresses = false;
                }
            }
        }
        return total;
    }


    // Initialise Payment
    processPayment() {

        // check if user is still logged in
        if (this.authService.isUserloggedIn()) {

            this.showFullTransparentLoadingIndicator = true;

            // get the addresses of this user
            this.userService.getAddresses().subscribe(
                // success
                response => {
                    const validated = this.verifyAddresesAndDates(response);

                    // send cart to backend (if cart does not have id)
                    if (validated) {
                        // prepare cart to be created
                        const cartToCreate: CartCreateViewModel = this.cartService.prepareCartForCreate(this.Cart);
                        if (!this.Cart.id) {
                            // create cart
                            return this.orderService.createcart(cartToCreate).subscribe(
                                // success
                                (cartResponse: CartCreateViewModel) => {
                                    // receive and save cart id and order ids
                                    this.adjustCartAttributes(cartResponse);

                                    // upload pickup item pictures
                                    this.cartService.uploadPickupItemPictures(this.Cart);

                                    // proceed to payment
                                    this.initiatePayment();
                                },
                                // error
                                error => {
                                    this.notify.error('Problem processing payment, please try again.');
                                    this.showFullTransparentLoadingIndicator = false;
                                }
                            );
                        } else {
                            // Update Cart
                            return this.orderService.updatecart(cartToCreate).subscribe(
                                // success
                                () => {
                                    this.continuePaymentAfterCartUpdate(this.Cart);
                                },
                                // error
                                error => {
                                    this.notify.error('Problem processing payment, please try again.');
                                    this.showFullTransparentLoadingIndicator = false;
                                }
                            );
                        }
                    }
                },

                // error
                error => {
                    this.showFullTransparentLoadingIndicator = false;
                }
            );
        } else {
            location.href = '/checkout';
        }
    }

    verifyAddresesAndDates(AddressList): boolean {
        this.Addresses = AddressList;

        // check if all addresses and dates have been set
        let datesSet = true;
        let addressesSet = true;
        let invalidAddress = false;
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (order.isPickup) {
                    if (!order.pickupDate) {
                        datesSet = false;
                    }
                    if (!order.pickupAddress) {
                        addressesSet = false;
                    } else {
                        if (!this.Addresses.find( o => o.id === order.pickupAddress.id)) {
                            invalidAddress = true;
                            order.pickupAddress = null;
                        }
                    }
                }
                if (!order.deliveryAddress) {
                    addressesSet = false;
                } else {
                    if (!this.Addresses.find( o => o.id === order.deliveryAddress.id)) {
                        invalidAddress = true;
                        order.deliveryAddress = null;
                    }
                }
            }
        }

        if (datesSet && addressesSet && !invalidAddress) {
            return true;
        } else {
            this.showFullTransparentLoadingIndicator = false;
            if (!datesSet || !addressesSet) {
                this.notify.error('Set all ' + (!addressesSet ? 'addresses' : '') + (!addressesSet && !datesSet ? ' and ' : '')
                    + (!datesSet ? 'pickup dates' : '') + ' before proceeding to payment');
            } else {
                this.notify.error('Sorry, seems some addresses don\'t exist anymore. Please make new selections');
                this.cartService.updateCart(this.Cart, true, false);
                // this.cartService.emptyCart(false);
                // location.href = '/checkout';
            }
            return false;
        }
    }

    adjustCartAttributes(cartObj: CartCreateViewModel) {
        // adjust cart
        this.Cart.id = cartObj.id;

        // adjust orders
        let count = 0;
        for (const serviceForm of this.Cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                const asscOrder = cartObj.orders[count++];
                order.orderId = asscOrder.id;
                if (order.isPickup) {
                    order.pickupItem.id = asscOrder.pickupItems[0].id;
                }
            }
        }
        this.cartService.updateCart(this.Cart, false, false);
    }

    continuePaymentAfterCartUpdate(cart: Cart) {
        this.orderService.getCart(cart.id).subscribe(
            // success
            (cartObj: CartCreateViewModel) => {
                // adjust cart
                cart.id = cartObj.id;

                // sort by servic ids
                const newCartObj = new CartCreateAdjustViewModel();
                newCartObj.serviceOrders = [];
                for (const ord of cartObj.orders) {
                    let serviceOrder = newCartObj.serviceOrders.find(o => o.serviceId === ord.serviceId);
                    if (!serviceOrder) {
                        serviceOrder = new CartAdjustServiceOrder();
                        serviceOrder.serviceId = ord.serviceId;
                        serviceOrder.orders = [];
                        newCartObj.serviceOrders.push(serviceOrder);
                    }
                    serviceOrder.orders.push(ord);
                }

                // adjust orders
                let count = 0;
                let innerCount = 0;
                for (const serviceForm of cart.serviceOrders) {
                    innerCount = 0;
                    for (const order of serviceForm.orders) {
                        const asscOrder = newCartObj.serviceOrders[count].orders[innerCount];
                        order.orderId = asscOrder.id;
                        if (order.isPickup) {
                            order.pickupItem.id = asscOrder.pickupItems[0].id;
                        }
                        innerCount++;
                    }
                    count++;
                }

                // push cart back to memory
                localStorage.setItem('cart', JSON.stringify(cart));

                // upload pickup item pictures
                this.cartService.uploadPickupItemPictures(cart);

                // proceed to payment
                this.initiatePayment();
            },
            // error
            error => {}
        );
    }


    // Initiate Payment
    initiatePayment() {
        if (this.verifyPaymentDetails()) {
            // (document.getElementById('pymt_btn') as HTMLElement).click();
            // this.flutterwave.inlinePay(this.paymentData);
            setTimeout(() => {
                (document.getElementsByClassName('flutterwave-pay-button')[0] as HTMLElement).click();
            });
        } else {
            this.notify.error('Problem processing payment, please reload the page and try again.');
        }
        this.showFullTransparentLoadingIndicator = false;
    }

    verifyPaymentDetails() {
        /*this.options = {
            amount: (this.cartTotal() + this.ShippingCost) * 100,
            email: this.authService.getUser().email,
            ref: 'trx_qwWeb_' + this.Cart.id, // + '_' + Math.ceil(Math.random() * 10e10), // --- use cart id as reference
            // key: 'pk_test_bdeaa2d769c5e4d1a5449558ace8435fde52f369' // pk_live_b3787a69848f51a15247b2e18d5580f50f1f20a1
            // key: 'FLWPUBK_TEST-81295c527896f1efa1a3d0c62d7d82b8-X'
        };*/

        // setup payment info
        this.paymentData.amount = this.cartTotal() + this.ShippingCost; // ) * 100;
        this.paymentData.tx_ref = 'trx_qwWeb_' + this.Cart.id;

        // ensure shipping cost has been calculated
        if (this.ShippingCost > 0) {
            return true;
        } else {
            return false;
        }
    }


    // Finish Payment
    paymentDone(ref: any) {
        this.showFullTransparentLoadingIndicator = true;
        if (ref.status === 'success') {
            // verify payment on the server
            this.orderService.verifyPayment(this.Cart.id,
                {paymentReference: ref.reference, amount: (this.cartTotal() + this.ShippingCost) * 100})
            .subscribe(
                // success
                response => {
                    this.router.navigate(['/checkout/complete', response.trackingId]);
                },

                // error
                error => {
                    this.notify.error('Problem processing payment, please try again.');
                    this.showFullTransparentLoadingIndicator = false;
                }
            );
        } else {
            this.showFullTransparentLoadingIndicator = false;
        }
    }

    paymentCancel() {}

    // FLUTTERWAVE-V3
    paymentCallback(paymentResponse: PaymentSuccessResponse): void {
        this.zone.run(
            () => {
                this.flutterwave.closePaymentModal(1);
                this.renderer.addClass(document.body, 'overflow-auto');
                $('iframe[name ="checkout"]').css({position: 'fixed'});
                this.showFullTransparentLoadingIndicator = true;
                if (paymentResponse.status === 'successful') {
                    // verify payment on the server
                    this.orderService.verifyPayment(this.Cart.id,
                        {paymentReference: paymentResponse.transaction_id + '', amount: this.cartTotal() + this.ShippingCost})
                    .subscribe(
                        // success
                        response => {
                            this.router.navigate(['/checkout/complete', response.trackingId]);
                        },

                        // error
                        error => {
                            this.notify.error('Problem processing payment, please try again.');
                            this.showFullTransparentLoadingIndicator = false;
                        }
                    );
                } else {
                    this.notify.error('Problem processing payment, please try again.');
                    this.showFullTransparentLoadingIndicator = false;
                }
            }
        );
    }
}
