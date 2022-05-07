import { VisitorOrderService } from 'src/app/visitor/services/visitor-order.service';
import { AuthService } from './../../../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { ServiceForm } from 'src/app/models/service';
import { ProductListViewModel, CartProductViewModel } from 'src/app/models/product';
import { Cart, CartCreateViewModel, CartServiceOrder } from 'src/app/models/cart';
import { VisitorProductService } from 'src/app/visitor/services/visitor-product.service';
import { VisitorCartService } from 'src/app/visitor/services/visitor-cart.service';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorProductItemComponent } from '../../visitor-product-item/visitor-product-item.component';

@Component({
    selector: 'app-visitor-cart',
    templateUrl: './visitor-cart.component.html',
    styleUrls: ['./visitor-cart.component.css']
})
export class VisitorCartComponent implements OnInit, OnDestroy {

    Cart: Cart;
    OriginalCart: Cart;

    ChangesMade: boolean[][] = [];

    Search = {
        searchTerm: '',
        section: 'products'
    };

    showFullTransparentLoadingIndicator = false;
    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: true,
        // backdrop: 'static'
    };


    blockCart = false;
    blockCartServiceIndex = null;
    blockCartOrderIndex = null;

    constructor(title: Title,
                private productService: VisitorProductService,
                private cartService: VisitorCartService,
                private authService: AuthService,
                private orderService: VisitorOrderService,
                private modalService: NgbModal,
                private domSanitizer: DomSanitizer,
                private notify: NotificationService,
                private router: Router) {
        // set page title
        title.setTitle('Cart | Quick Waka');
    }

    ngOnInit() {
        let getOnlinePendingCart = false;

        // get Cart
        this.Cart = this.cartService.getCart();
        if (this.Cart) {
            getOnlinePendingCart = this.Cart.id === undefined || this.Cart.id == null;
            this.OriginalCart = JSON.parse(JSON.stringify(this.Cart));

            // setup changes made
            this.setupChangesMade();
        } else {
            getOnlinePendingCart = true;
        }

        // get pending cart from server
        if (getOnlinePendingCart && this.authService.isUserloggedIn()) {
            this.retrievePendingCart();
        }
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }


    // Online Pending Cart
    retrievePendingCart() {
        // Show loading idicator
        this.showFullTransparentLoadingIndicator = true;

        this.orderService.getPendingCart().subscribe(
            // success
            (cartObj: CartCreateViewModel) => {
                if (cartObj) {
                    // add cart
                    const cart = new Cart();
                    cart.id = cartObj.id;

                    // add orders
                    let serviceOrder: CartServiceOrder;
                    for (const ord of cartObj.orders) {
                        if (cart.serviceOrders) {
                            serviceOrder = cart.serviceOrders.find (o => o.service.id === ord.serviceId);
                        } else {
                            cart.serviceOrders = [];
                        }
                        if (!serviceOrder) {
                            serviceOrder = new CartServiceOrder();
                            serviceOrder.service = ord.service;
                            serviceOrder.orders = [];
                            cart.serviceOrders.push(serviceOrder);
                        }

                        // create serviceform from order
                        const newOrder = new ServiceForm();
                        newOrder.orderId = ord.id;
                        newOrder.deliveryAddress = ord.address;
                        if (ord.type === 'pickup') {
                            newOrder.isPickup = true;
                            newOrder.purchaseItems = null;
                            newOrder.pickupAddress = ord.pickupItems[0].address;
                            newOrder.pickupDate = (new Date(ord.pickupTime)).toString();
                            newOrder.pickupTempDate = new Date(ord.pickupTime);
                            newOrder.pickupItem = {
                                id: ord.pickupItems[0].id,
                                name: ord.pickupItems[0].name,
                                value: ord.pickupItems[0].value,
                                size: ord.pickupItems[0].size,
                                isFragile: ord.pickupItems[0].fragile,
                                count: ord.pickupItems[0].quantity,
                                description: ord.pickupItems[0].description,
                                pictures: null
                            };
                            if (ord.pickupItems[0].photos && ord.pickupItems[0].photos.length > 0) {
                                newOrder.pickupItem.pictures = [];
                                for (const photo of ord.pickupItems[0].photos) {
                                    newOrder.pickupItem.pictures.push({
                                        url: photo.url,
                                        uploaded: true,
                                        isLink: true
                                    });
                                }
                            }
                        } else {
                            newOrder.isPickup = false;
                            newOrder.pickupItem = null;
                            newOrder.purchaseItems = [];
                            for (const prodOrd of ord.productOrders) {
                                const purchaseItem: CartProductViewModel = {
                                    id: prodOrd.productId,
                                    name: prodOrd.product.name,
                                    pictureUrl: (prodOrd.product.photos && prodOrd.product.photos[0] && prodOrd.product.photos[0].url)
                                        ? prodOrd.product.photos[0].url : null,
                                    price: prodOrd.product.price,
                                    quantity: prodOrd.quantity,
                                    prod_Category: null,
                                    vendor: prodOrd.product.vendor ?
                                    {id: prodOrd.product.vendor.id, name: prodOrd.product.vendor.name, address: null, imageUrl: null} : null
                                };
                                newOrder.purchaseItems.push(purchaseItem);
                            }

                        }

                        // add serviceform
                        serviceOrder.orders.push(newOrder);
                    }

                    // Add existing orders to new cart
                    let hadExisitingCart = false;
                    if (this.Cart && this.Cart.serviceOrders && this.Cart.serviceOrders.length > 0) {
                        hadExisitingCart = true;
                        for (const serviceOrd of this.Cart.serviceOrders) {
                            const serviceOrdFound = cart.serviceOrders.find(o => o.service.id === serviceOrd.service.id);
                            if (!serviceOrdFound) {
                                cart.serviceOrders.push(serviceOrd);
                                break;
                            } else {
                                for (const existingOrder of serviceOrd.orders) {
                                    serviceOrdFound.orders.push(existingOrder);
                                }
                            }
                        }
                    }

                    // Add cart to localstorage
                    this.cartService.updateCart(cart, hadExisitingCart, hadExisitingCart);

                    // Update cart view
                    this.Cart = this.cartService.getCart();
                    this.setupChangesMade();

                    // Hide loading idicator
                    this.showFullTransparentLoadingIndicator = false;
                } else {
                    // Hide loading idicator
                    this.showFullTransparentLoadingIndicator = false;
                }
            },

            // error
            error => {
                // Hide loading idicator
                this.showFullTransparentLoadingIndicator = false;
            }
        );
    }


    // Purchase
    decreaseQuantity(Item: CartProductViewModel, serviceIndex, orderIndex) {
        if (isNaN(Item.quantity)) {
            Item.quantity = 1;
        }
        let newValue = Item.quantity - 1;
        if (newValue < 1) {
            newValue = 1;
        }
        Item.quantity = newValue;

        this.adjustChangesMade(serviceIndex, orderIndex);
    }

    increaseQuantity(Item: CartProductViewModel, serviceIndex, orderIndex) {
        if (isNaN(Item.quantity)) {
            Item.quantity = 0;
        }
        let newValue = Item.quantity + 1;
        if (newValue < 1) {
            newValue = 1;
        }
        Item.quantity = newValue;

        this.adjustChangesMade(serviceIndex, orderIndex);
    }

    adjustChangesMade(serviceIndex: number, orderIndex: number) {
        const originalOrder = JSON.stringify(this.OriginalCart.serviceOrders[serviceIndex].orders[orderIndex]);
        const newOrder = JSON.stringify(this.Cart.serviceOrders[serviceIndex].orders[orderIndex]);
        if (originalOrder !== newOrder) {
            this.blockCart = true;
            this.blockCartServiceIndex = serviceIndex;
            this.blockCartOrderIndex = orderIndex;
            this.ChangesMade[serviceIndex][orderIndex] = true;
        } else {
            if (this.blockCartServiceIndex ===  serviceIndex && this.blockCartOrderIndex === orderIndex) {
                this.blockCart = false;
                this.blockCartServiceIndex = null;
                this.blockCartOrderIndex = null;
            }
            this.ChangesMade[serviceIndex][orderIndex] = false;
        }
    }

    purchaseTotal(Order: ServiceForm) {
        let total = 0;
        for (const item of Order.purchaseItems) {
            total += item.price * item.quantity;
        }
        return total;
    }

    removePurcahseItem(serviceIndex, orderIndex, itemIndex) {
        if (this.cartService.removePurchaseItem(serviceIndex, orderIndex, itemIndex)) {
            if (this.Cart && this.Cart.serviceOrders && this.Cart.serviceOrders[serviceIndex]) {
                const serviceOrder = this.Cart.serviceOrders[serviceIndex];
                if (serviceOrder && serviceOrder.orders && serviceOrder.orders[orderIndex]) {
                    const order = serviceOrder.orders[orderIndex];
                    if (order.purchaseItems && order.purchaseItems.length > itemIndex) {
                        order.purchaseItems.splice(itemIndex, 1);
                    }

                    // if it was the ony item, remove the order
                    if (order.purchaseItems.length === 0) {
                        serviceOrder.orders.splice(orderIndex, 1);
                    }

                    // if it was the ony order, remove the service
                    if (serviceOrder.orders.length === 0) {
                        this.Cart.serviceOrders.splice(serviceIndex, 1);
                    }
                }
            }
            // this.notify.info('Item was deleted');
        } else {
            this.notify.error('Problem removing item from order');
        }
    }

    removeOrder(serviceIndex, orderIndex) {
        if (this.cartService.removeOrder(serviceIndex, orderIndex)) {
            if (this.Cart && this.Cart.serviceOrders && this.Cart.serviceOrders[serviceIndex]) {
                const serviceOrder = this.Cart.serviceOrders[serviceIndex];
                if (serviceOrder && serviceOrder.orders && serviceOrder.orders[orderIndex]) {
                    serviceOrder.orders.splice(orderIndex, 1);
                }

                // if it was the ony order, remove the service
                if (serviceOrder.orders.length === 0) {
                    this.Cart.serviceOrders.splice(serviceIndex, 1);
                }
            }
            // this.notify.info('Item was deleted');
        } else {
            this.notify.error('Problem removing item from order');
        }
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
                this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.modalConfig);
                this.currentDialog.componentInstance.initialState = initialState;

                // hide loaidng icon
                this.showFullTransparentLoadingIndicator = false;
            },

            // error
            error => {this.notify.error('Problem loading product information, please try again.');}
        );
    }


    // Changes
    setupChangesMade() {
        if (this.Cart.serviceOrders) {
            let i = 0;
            for (const serviceForm of this.Cart.serviceOrders) {
                let j = 0;
                this.ChangesMade[i] = [];
                for (const order of serviceForm.orders) {
                    this.ChangesMade[i][j] = false;
                    j++;
                }
                i++;
            }
        }
    }

    cancelOrderUpdate(serviceIndex: number, orderIndex: number) {
        let index = 0;
        for (const item of this.Cart.serviceOrders[serviceIndex].orders[orderIndex].purchaseItems) {
            item.quantity = this.OriginalCart.serviceOrders[serviceIndex].orders[orderIndex].purchaseItems[index].quantity;
            index++;
        }
        this.blockCart = false;
        this.blockCartServiceIndex = null;
        this.blockCartOrderIndex = null;
        this.ChangesMade[serviceIndex][orderIndex] = false;
    }

    updateOrder(serviceIndex: number, orderIndex: number) {
        const newOrder = this.Cart.serviceOrders[serviceIndex].orders[orderIndex];
        this.OriginalCart.serviceOrders[serviceIndex].orders[orderIndex] = JSON.parse(JSON.stringify(newOrder));
        this.cartService.updateCart(this.Cart, true, false);
        this.blockCart = false;
        this.blockCartServiceIndex = null;
        this.blockCartOrderIndex = null;
        this.ChangesMade[serviceIndex][orderIndex] = false;
    }


    // Pickup
    allowImageURL(url: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }


    // Cart
    cartTotal() {
        let total = 0;
        let i = 0;
        for (const serviceForm of this.Cart.serviceOrders) {
            let j = 0;
            for (const order of serviceForm.orders) {
                if (!order.isPickup) {
                    for (const item of order.purchaseItems) {
                        total += item.price * item.quantity;
                    }
                }
                j++;
            }
            i++;
        }
        return total;
    }


    // Search
    search() {
        if (this.Search.searchTerm.trim().length > 0) {
            this.router.navigate(['/search', this.Search.section],
            { queryParams : { searchTerm : this.Search.searchTerm}});
        }
    }

}
