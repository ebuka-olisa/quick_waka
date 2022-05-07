import { Address } from './address';

export class StaffViewModel {
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
    userName: string;
    email: string;
    phone: string;
    role: string;
    photoUrl: string;
    removePhoto: boolean;
    addresses: Address[];
    deactivated: boolean | string;

    constructor() {
        this.addresses = [{ id: 0, street: '', city: '', state: '', country: 'Nigeria'}];
    }
}

export class RiderLiteViewModel{
    id: number;
    firstName: string;
    lastname: string;
}
