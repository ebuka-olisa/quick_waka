import { Injectable } from '@angular/core';
import { StatusOption } from '../models/product';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    States = ['Abuja FCT', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
        'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nassarawa',
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
        'Zamafara'];

    StatusOptions: StatusOption[] = [
        {name: 'Active', value: 'false', iconClass: 'active'},
        {name: 'Inactive', value: 'true', iconClass: ''}
    ];

    AvailabilityOptions: StatusOption[] = [
        {name: 'Available', value: 'false', iconClass: 'available'},
        {name: 'Out of Stock', value: 'true', iconClass: 'outOfStock'}
    ];

    OrderStateOptions: StatusOption[] = [
        {name: 'Pending', value: 'Pending', iconClass: 'pending'},
        {name: 'Enroute', value: 'On The Way', iconClass: 'ontheway'},
        {name: 'Delivered', value: 'Delivered', iconClass: 'delivered'}
    ];

    DaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // navigateAwaySelection$: Subject<boolean> = new Subject<boolean>();

    constructor() { }

}
