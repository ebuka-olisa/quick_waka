import { Address } from './address';

export class VendorViewModel {
    id: number;
    name: string;
    email: string;
    phone: string;
    phone2?: string;
    logo?: Photo;
    address: Address;
    canDelete?: boolean;
    description?: string;
}

export class Photo {
    id: number;
    url: string;
    deleted?: boolean;
}

export class VendorLiteViewModel {
    id: number;
    address: string;
    imageUrl: string;
    name: string;
}

export class VendorGroupViewModel {
    constructor(title) {
        this.title = title;
        this.vendors = [];
    }

    title: string;
    vendors: VendorLiteViewModel[];
}
