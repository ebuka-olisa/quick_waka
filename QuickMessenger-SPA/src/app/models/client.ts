import { StaffViewModel } from './staff';
import { Address } from './address';

export class ClientViewModel {
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    photoUrl: string;
    removePhoto: boolean;
    deactivated: boolean;
    addresses: Address[];

    constructor() {
        this.addresses = [{ id: 0, street: '', city: '', state: '', country: 'Nigeria'}];
    }
}
