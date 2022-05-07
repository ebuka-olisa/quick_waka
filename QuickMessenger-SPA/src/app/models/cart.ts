import { DeliveryAddress } from './address';
import { Photo } from './vendor';
import { ServiceViewModel, ServiceForm } from './service';
import { ProductViewModel } from './product';

export class Cart {
    id: number;
    serviceOrders: CartServiceOrder[];
}

export class CartServiceOrder {
    id: number;
    service: ServiceViewModel;
    orders: ServiceForm[];
}


/*----- CART CREATION -----*/
export class CartCreateViewModel {
    id: number;
    clientId: number;
    orders: CartServiceOrderCreateViewModel[];
}

export class CartServiceOrderCreateViewModel {
    id: number;
    clientId: number;
    addressId: number;
    address?: DeliveryAddress; // for getting pending cart
    type: string;
    serviceId: number;
    service: ServiceViewModel; // for getting pending cart
    pickupTime: string;
    pickupItems: PickupItemForCreate[];
    productOrders: CartProductForCreate[];
}

export class PickupItemForCreate {
    id: number;
    name: string;
    description: string;
    size: string;
    fragile: boolean;
    value: number;
    photos?: Photo[];
    quantity: number;
    addressId: number;
    address?: DeliveryAddress; // for getting pending cart
}

export class CartProductForCreate {
    productId: number;
    product?: ProductViewModel; // for getting pending cart
    orderId: number;
    quantity: number;
    productPrice: number;
}

export class CartCreateAdjustViewModel {
    id: number;
    clientId: number;
    serviceOrders: CartAdjustServiceOrder[];
}

export class CartAdjustServiceOrder {
    serviceId: number;
    orders: CartServiceOrderCreateViewModel[];
}


/*----- CART VIEW -----*/
export class CartDisplayViewModel {
    id: number;
    date: string;
    clientId: number;
    orders: CartServiceOrderDisplayViewModel[];
    cost: number;
}

export class CartServiceOrderDisplayViewModel {
    id: number;
    trackingId?: number;
    cartTrackingId?: number;
    clientId: number;
    addressId: number;
    address: DeliveryAddress;
    date: string;
    pickupItems: PickupItemForCreate[];
    pickupTime: string;
    productOrders: CartProductForCreate[];
    type: string;
    cost: number;
    deliveryCharge: number;
    state: string;
    serviceId: number;
    service: ServiceViewModel;
}
