export class Address {
    id: number;
    street: string;
    city: string;
    state: string;
    country: string;
    deleted?: boolean;
}

export class DeliveryAddress extends Address {
    lastName: string;
    firstName: string;
    phone: string;
    defaultAdd: boolean;
}
