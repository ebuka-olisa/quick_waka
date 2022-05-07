import { DeliveryAddress } from 'src/app/models/address';
import { VisitorUserService } from './visitor-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { VisitorOrderService } from 'src/app/visitor/services/visitor-order.service';
import { CartServiceOrder, CartCreateViewModel, CartServiceOrderCreateViewModel,
    CartCreateAdjustViewModel, CartAdjustServiceOrder } from './../../models/cart';
import { ServiceForm, ServiceViewModel, PickupItemPhoto } from './../../models/service';
import { Injectable } from '@angular/core';
import { ProductListViewModel, CartProductViewModel } from 'src/app/models/product';
import { Cart } from 'src/app/models/cart';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class VisitorCartService {

    private announcement = new Subject<boolean>();

    constructor(private orderService: VisitorOrderService,
                private authService: AuthService,
                private userService: VisitorUserService) { }

    // add
    addItem(product: ProductListViewModel, service: ServiceViewModel) {
        try {
            if (product.price && product.price !== 0) {
                const item: CartProductViewModel = {
                    id: product.id,
                    name: product.name,
                    pictureUrl: product.pictureUrl,
                    price: product.price,
                    quantity: 1,
                    prod_Category: null,
                    vendor: product.vendor ? {id: product.vendor.id, name: product.vendor.name, address: null, imageUrl: null} : null
                };

                // get current cart
                const cart = this.getCart();

                // if service does not exist, add service
                let serviceOrder: CartServiceOrder;
                if (cart.serviceOrders) {
                    serviceOrder = cart.serviceOrders.find (o => o.service.id === service.id);
                } else {
                    cart.serviceOrders = [];
                }
                if (!serviceOrder) {
                    serviceOrder = new CartServiceOrder();
                    serviceOrder.service = service;
                    serviceOrder.orders = [];
                    cart.serviceOrders.push(serviceOrder);
                }

                // if automatic service order does not exist, add it
                let order: ServiceForm;
                if (serviceOrder.orders) {
                    order = serviceOrder.orders.find(o => o.auto === true);
                } else {
                    serviceOrder.orders = [];
                }
                if (!order) {
                    this.createNewAutoOrder(item, serviceOrder, cart);
                } else {

                    // add item only if it has not be added previously
                    if (order.purchaseItems.find(o => o.id === item.id) == null) {
                        order.purchaseItems.push(item);
                    }

                    // push cart back to memory
                    this.updateCart(cart, true, true);
                }

                return true;
            }
        } catch {
            return false;
        }
    }

    addOrder(newOrder: ServiceForm, pictures: any[], service: ServiceViewModel) {
        try {
            // set up order
            const order: ServiceForm = JSON.parse(JSON.stringify(newOrder));
            if (order.isPickup === 'true') {
                order.isPickup = true;
                order.purchaseItems = null;

                // process pictures if any
                if (pictures && pictures.length > 0) {
                    order.pickupItem.pictures = [];
                    for (const pic of pictures) {
                        order.pickupItem.pictures.push({ url: pic.dataURL, uploaded: false, isLink: false});
                    }
                }
            } else {
                order.isPickup = false;
                order.pickupItem = null;
            }

            // get current cart
            const cart = this.getCart();

            // add order to cart (add order under service)
            let serviceOrder: CartServiceOrder;
            if (cart.serviceOrders) {
                serviceOrder = cart.serviceOrders.find (o => o.service.id === service.id);
            } else {
                cart.serviceOrders = [];
            }
            if (!serviceOrder) {
                serviceOrder = new CartServiceOrder();
                serviceOrder.service = service;
                serviceOrder.orders = [];
                cart.serviceOrders.push(serviceOrder);
            }
            serviceOrder.orders.push(order);

            // push back to memory
            this.updateCart(cart, true, true);

            return true;
        } catch {
            return false;
        }
    }

    createNewAutoOrder(item: CartProductViewModel, serviceOrder: CartServiceOrder, cart: Cart) {
        if (this.authService.isUserloggedIn()) {
            this.userService.getAddresses().subscribe(
                // success
                response => {
                    const Addresses = response;
                    const defaultAddress = Addresses.find(x => x.defaultAdd === true);
                    this.completeNewAutoOrder(defaultAddress, item, serviceOrder, cart);
                },

                error => {
                    return null;
                }
            );
        } else {
            this.completeNewAutoOrder(null, item, serviceOrder, cart);
        }

    }

    completeNewAutoOrder(defaultAddress: DeliveryAddress, item: CartProductViewModel, serviceOrder: CartServiceOrder, cart: Cart) {
        const order = new ServiceForm();
        order.auto = true;
        order.purchaseItems = [];
        if (defaultAddress) {
            order.deliveryAddress = defaultAddress;
        }
        serviceOrder.orders.push(order);

        // add item only if it has not be added previously
        if (order.purchaseItems.find(o => o.id === item.id) == null) {
            order.purchaseItems.push(item);
        }

        // push cart back to memory
        this.updateCart(cart, true, true);
    }

    // update
    prepareCartForCreate(cartObj: Cart): CartCreateViewModel {
        const clientId = Number.parseInt(this.authService.getUser().id, 10);
        const cartCreateObj = new CartCreateViewModel();
        cartCreateObj.id = cartObj.id ? cartObj.id : 0;
        cartCreateObj.clientId = clientId;
        cartCreateObj.orders = [];
        for (const serviceForm of cartObj.serviceOrders) {
            for (const order of serviceForm.orders) {
                const newOrder = new CartServiceOrderCreateViewModel();
                newOrder.id = order.orderId ? order.orderId : 0;
                newOrder.addressId = order.deliveryAddress ? order.deliveryAddress.id : 0;
                newOrder.clientId = clientId;
                newOrder.type = order.isPickup ? 'pickup' : 'purchase';
                newOrder.serviceId = serviceForm.service.id;
                if (order.isPickup) {
                    const pTime = new Date(order.pickupDate);
                    pTime.setHours(pTime.getHours() + 1);
                    newOrder.pickupTime = pTime.toISOString();
                    newOrder.pickupItems = [
                        {
                            id: order.pickupItem.id ? order.pickupItem.id : 0, name: order.pickupItem.name,
                            description: order.pickupItem.description, size: order.pickupItem.size,
                            value: order.pickupItem.value,
                            fragile: order.pickupItem.isFragile === true || order.pickupItem.isFragile === 'true'  ? true : false,
                            quantity: order.pickupItem.count, addressId: order.pickupAddress ? order.pickupAddress.id : 0
                        }
                    ];
                } else {
                    newOrder.productOrders = [];
                    for (const item of order.purchaseItems) {
                        newOrder.productOrders.push({productId: item.id, quantity: item.quantity, productPrice: item.price,
                            orderId: order.orderId ? order.orderId : 0});
                    }
                }
                cartCreateObj.orders.push(newOrder);
            }
        }
        return cartCreateObj;
    }

    updateCart(cart: Cart, updateOnline: boolean, getNewCart: boolean) {
        localStorage.setItem('cart', JSON.stringify(cart));

        // announce cart update
        this.announceCartUpdate();

        // update online
        if (cart.id && this.authService.isUserloggedIn() && updateOnline) {
            // prepare cart to be updated
            const cartToUpdate: CartCreateViewModel = this.prepareCartForCreate(cart);

            // update cart
            this.orderService.updatecart(cartToUpdate).subscribe(
                // success
                () => {
                    if (getNewCart) {
                        // get new cart info and adjust where necessary
                        this.adjustCartAttributes(cart);
                    }
                },
                // error
                error => {}
            );
        }
    }

    adjustCartAttributes(cart: Cart) {
        this.orderService.getCart(cart.id).subscribe(
            // success
            (cartObj: CartCreateViewModel) => {
                // adjust cart
                cart.id = cartObj.id;

                // sort by service ids
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
                this.uploadPickupItemPictures(cart);
            },
            // error
            error => {}
        );
    }

    emptyCart(deleteOnline: boolean) {
        // delete cart online
        const cart = this.getCart();
        if (deleteOnline && cart.id) {
            this.orderService.deletecart(cart.id).subscribe(
                // success
                response => {},
                // error
                error => {}
            );
        }

        // remove cart
        localStorage.removeItem('cart');

        // announce cart update
        this.announceCartUpdate();
    }

    // upload pictures
    uploadPickupItemPictures(cart: Cart) {
        for (const serviceForm of cart.serviceOrders) {
            for (const order of serviceForm.orders) {
                if (order.isPickup && order.pickupItem && order.pickupItem.pictures) {
                    this.startUploadPickupItemPhotos(cart, order.pickupItem.id, order.pickupItem.pictures, 0);
                }
            }
        }
    }

    startUploadPickupItemPhotos(cart: Cart, pickupItemId: number, pictures: PickupItemPhoto[], pictureIndex: number) {
        if (!pictures[pictureIndex].uploaded) {
            return this.orderService.uploadPickupItemPhoto(pickupItemId, pictures[pictureIndex].url)
                .subscribe(

                    // success
                    () => {
                        // this.Cart.serviceOrders[].orders[].pickupItem.
                        pictures[pictureIndex].uploaded = true;
                        this.updateCart(cart, false, false);
                        this.completePictureUpload(cart, pickupItemId, pictures, pictureIndex);
                    },

                    // error
                    error => {
                        // this.completeProductSaveWithPictureError();
                    }
                );
        } else {
            return this.completePictureUpload(cart, pickupItemId, pictures, pictureIndex);
        }
    }

    completePictureUpload(cart: Cart, pickupItemId, pictures: PickupItemPhoto[], pictureIndex: number) {
        if (pictureIndex === (pictures.length - 1) || pictureIndex === 2) {
        } else {
            this.startUploadPickupItemPhotos(cart, pickupItemId, pictures, pictureIndex + 1);
        }
    }


    // remove
    removePurchaseItem(serviceIndex: number, orderIndex: number, itemIndex: number) {
        try {
            // get cart
            const cart = this.getCart();

            // remove item
            if (cart && cart.serviceOrders && cart.serviceOrders[serviceIndex]) {
                const serviceOrder = cart.serviceOrders[serviceIndex];
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
                        cart.serviceOrders.splice(serviceIndex, 1);
                    }
                }
            }

            // if no service order exists, delete cart
            if (cart.serviceOrders.length === 0) {
                this.emptyCart(true);
            } else {
                // push cart back into memory
                this.updateCart(cart, true, false);
            }

            return true;
        } catch {
            return false;
        }
    }

    removeOrder(serviceIndex: number, orderIndex: number) {
        try {
            // get cart
            const cart = this.getCart();

            // remove item
            if (cart && cart.serviceOrders && cart.serviceOrders[serviceIndex]) {
                const serviceOrder = cart.serviceOrders[serviceIndex];
                if (serviceOrder && serviceOrder.orders && serviceOrder.orders[orderIndex]) {
                    serviceOrder.orders.splice(orderIndex, 1);
                }

                // if it was the ony order, remove the service
                if (serviceOrder.orders.length === 0) {
                    cart.serviceOrders.splice(serviceIndex, 1);
                }
            }

            // if no service order exists, delete cart
            if (cart.serviceOrders.length === 0) {
                this.emptyCart(true);
            } else {
                // push cart back into memory
                this.updateCart(cart, true, false);
            }

            return true;
        } catch {
            return false;
        }
    }


    private convertPictureToString(pic) {
        const imgCanvas = document.createElement('canvas');
        const imgContext = imgCanvas.getContext('2d');

        // Make sure canvas is as big as the picture
        imgCanvas.width = pic.width;
        imgCanvas.height = pic.height;

        // Draw image into canvas element
        imgContext.drawImage(pic, 0, 0, pic.width, pic.height);

        // Save image as a data URL
        const dataUrl = imgCanvas.toDataURL('image/png');

        return dataUrl;
    }

    // get
    getCart(): Cart {
        const currentCart = localStorage.getItem('cart');
        return currentCart ? JSON.parse(currentCart) : new Cart();
    }

    // announce
    announceCartUpdate() {
        this.announcement.next(true);
    }

    getAnnouncement(): Observable<boolean> {
        return this.announcement.asObservable();
    }
}
