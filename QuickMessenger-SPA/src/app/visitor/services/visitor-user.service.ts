import { AuthService } from './../../services/auth.service';
import { EditUser, ManageUserPassword } from './../../models/user';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryAddress } from 'src/app/models/address';
import { CartDisplayViewModel, CartServiceOrderDisplayViewModel } from 'src/app/models/cart';

@Injectable()
export class VisitorUserService {

    private visitorClientBase = environment.Url + 'client/client';
    private visitorOrderBase = environment.Url + 'client/order';

    constructor(private http: HttpClient,
                private authService: AuthService) { }

    /*----- USER -----*/
    // get details of logged in user
    getUserDetails(): Observable<EditUser> {
        const userId = this.authService.getUser().id;
        return this.http.get<EditUser>(this.visitorClientBase + '/user/' + userId);
    }

    // Update user details
    updateUserDetails(userInfo: EditUser): Observable<any> {
        return this.http.put(this.visitorClientBase + '/user/' + userInfo.id, userInfo);
    }

    // Change password
    changePassword(userPassword: ManageUserPassword): Observable<any> {
        return this.http.put(this.visitorClientBase + '/updatePassword/' + userPassword.id, userPassword);
    }



    /*----- ADDRESS -----*/
    // get addresses of logged in user
    getAddresses(): Observable<DeliveryAddress[]> {
        return this.http.post<DeliveryAddress[]>(this.visitorClientBase + '/addresses', null);
    }

    // get addresses by address id
    getAddress(addressId: number): Observable<DeliveryAddress> {
        return this.http.get<DeliveryAddress>(this.visitorClientBase + '/address/' + addressId);
    }

    // Create new address
    createAddress(address: DeliveryAddress): Observable<any> {
        return this.http.post(this.visitorClientBase + '/address/add', address);
    }

    // Update address
    editAddress(address: DeliveryAddress): Observable<any> {
        return this.http.put(this.visitorClientBase + '/address/' + address.id + '/update', address);
    }

    // Delete address
    deleteAddress(address: DeliveryAddress): Observable<any> {
        return this.http.delete(this.visitorClientBase + '/address/' + address.id);
    }



    /*----- CART/ORDER -----*/
    // get all carts of the user
    getCarts(): Observable<CartDisplayViewModel[]> {
        return this.http.post<CartDisplayViewModel[]>(this.visitorOrderBase + '/cart/notpending', null);
    }

    // get all carts of the user
    getOrder(orderId: number): Observable<CartServiceOrderDisplayViewModel> {
        return this.http.get<CartServiceOrderDisplayViewModel>(this.visitorOrderBase + '/' + orderId);
    }

}
