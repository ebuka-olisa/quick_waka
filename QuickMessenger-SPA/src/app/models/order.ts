import { ProductViewModel } from './product';
import { StaffViewModel } from 'src/app/models/staff';
import { Address, DeliveryAddress } from './address';
import { ClientViewModel } from './client';
import { ServiceListViewModel } from './service';

export class OrderListViewModel {
    id: number;
    clientName: string;
    address: Address;
    time: string;
    type: string;
    state: string;
}

export class OrderViewModel {
    id: number;
    trackingId: string;
    service: ServiceListViewModel;
    type: string;
    date: string;
    timeDelivered: string;
    riderId: number;
    rider: StaffViewModel;
    state: string;
    client: ClientViewModel;
    cost: number;
    deliveryCharge: number;
    address: DeliveryAddress;
    pickupTime: string;
    pickUpItems?: PickupItem[] = [];
    productOrders?: ProductOrder[] = [];
}

class PickupItem {
    id: number;
    name: string;
    size: string;
    value: number;
    fragile: boolean;
    description: string;
    pictureUrl: string;
    address: DeliveryAddress;
}

export class ProductOrder {
    productId: number;
    quantity: number;
    productPrice: number;
    product: ProductViewModel;
}

export class OrderUpdateViewModel{
    id: number;
    riderId: number;
    state: string;
}

export class OrderAddressViewModel {
    pickupAddressId: number;
    productIds: number[];
    addressId: number;
}
