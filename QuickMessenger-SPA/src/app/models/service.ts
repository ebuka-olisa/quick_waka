import { Photo } from './vendor';
import { ProductListViewModel, CartProductViewModel } from './product';
import { CategoryLiteViewModel } from './category';
import { DeliveryAddress } from './address';

export class ServiceListViewModel {
    id: number;
    name: string;
    canDelete?: boolean;
    pictureUrl: string;
}

export class ServiceViewModel {
    id: number;
    name: string;
    description?: string;
    photos: Photo[];
    canDelete?: boolean;
    generic: string|boolean;
    pickupAllowed: string|boolean;
    purchaseAllowed: string|boolean;
    isDefaultGeneric: string|boolean;
}

export class ServiceLiteViewModel {
    name: string;
    nameId: string;
}

export class ServiceProductListing {
    products: ProductListViewModel[];
    // parentCategories: CategoryLiteViewModel[];
    childrenCategories: CategoryLiteViewModel[];
    minPrice: number;
    maxPrice: number;
    category: CategoryLiteViewModel;
    service: ServiceLiteViewModel;
}

export class ServiceForm {
    orderId: number;
    auto = false;
    isPickup: boolean|string;
    pickupAddress: DeliveryAddress;
    pickupDate: string;
    pickupTempDate: Date;
    pickupItem: PickupItem;
    purchaseItems: CartProductViewModel[];
    deliveryAddress: DeliveryAddress;
}

export class PickupItem {
    id: number;
    name: string;
    value: number;
    size: string;
    isFragile: boolean | string;
    count: number;
    description: string;
    pictures: PickupItemPhoto[];
}

export class PickupItemPhoto {
    url: string;
    uploaded: boolean;
    isLink: boolean;
}
