import { ServiceViewModel } from './service';
import { VendorViewModel, VendorLiteViewModel } from 'src/app/models/vendor';
import { Photo } from './vendor';
import { CategoryDetailsViewModel } from './category';

export class ProductViewModel {
    id: number;
    name: string;
    description?: string;
    price: number;
    photos: Photo[];
    vendorId?: number;
    vendor?: VendorViewModel;
    prod_CategoryId?: number;
    prod_Category: CategoryDetailsViewModel;
    serviceId?: number;
    service: ServiceViewModel;
    productProperties: ProductProperty[];
    canDelete?: boolean;
    deactivated: boolean | string;
    outOfStock: boolean | string;
}

export class ProductProperty {
    propertyId: number;
    productId: number;
    value: string;
    deleted: boolean;
    propertyTypeName: string;
    measurementTypeSymbol: string;
    measurementTypeName?: string;
}

export class StatusOption {
    name: string;
    value: string;
    iconClass: string;
}

export class ProductListViewModel {
    id: number;
    name: string;
    price: number;
    pictureUrl: string;
    prod_Category: CategoryDetailsViewModel;
    vendor?: VendorLiteViewModel;
    service?: ServiceViewModel;
}

export class CartProductViewModel extends ProductListViewModel{
    quantity: number;
}
