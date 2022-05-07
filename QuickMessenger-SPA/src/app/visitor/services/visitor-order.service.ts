import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartCreateViewModel } from 'src/app/models/cart';

@Injectable()
export class VisitorOrderService {

    private visitorOrderBase = environment.Url + 'client/order';

    constructor(private http: HttpClient) { }


    // Get Service Charge
    getServiceCharge(orderAddresses): Observable<any> {
        return this.http.post<any>(this.visitorOrderBase + '/serviceCharge', orderAddresses);
    }

    // track item
    track(trackingId: string): Observable<any> {
        return this.http.post<any>(this.visitorOrderBase + '/track/' + trackingId, null);
    }


    /*----- CART -----*/
    // get Cart
    getCart(cartId: number): Observable<CartCreateViewModel> {
        return this.http.get<CartCreateViewModel>(this.visitorOrderBase + '/cart/' + cartId);
    }

    // get Pending Cart
    getPendingCart(): Observable<CartCreateViewModel> {
        return this.http.get<CartCreateViewModel>(this.visitorOrderBase + '/pendingCart');
    }

    // Create Cart
    createcart(cart: CartCreateViewModel): Observable<CartCreateViewModel> {
        return this.http.post<CartCreateViewModel>(this.visitorOrderBase + '/createcart', cart);
    }

    // Upload pickup item image
    uploadPickupItemPhoto(pickupItemId: number, imageDataURL: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', this.b64toFile(imageDataURL));

        return this.http.post(this.visitorOrderBase + '/pickupItem/addPhoto/' + pickupItemId, formData);
    }

    private b64toFile(dataURI): File {
        // convert the data URL to a byte string
        const byteString = atob(dataURI.split(',')[1]);

        // pull out the mime type from the data URL
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // Convert to byte array
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // Create a blob that looks like a file.
        const blob = new Blob([ab], {type: mimeString });
        blob['lastModifiedDate'] = (new Date()).toISOString();
        blob['name'] = 'file';

        // Figure out what extension the file should have
        switch (blob.type) {
            case 'image/jpeg':
                blob['name'] += '.jpg';
                break;
            case 'image/png':
                blob['name'] += '.png';
                break;
        }
        // cast to a File
        return blob as File;
    }

    // Update Cart
    updatecart(cart: CartCreateViewModel): Observable<CartCreateViewModel> {
        return this.http.put<CartCreateViewModel>(this.visitorOrderBase + '/update/' + cart.id, cart);
    }

    // Delete Cart
    deletecart(cartId: number): Observable<any> {
        return this.http.delete<any>(this.visitorOrderBase + '/cart/' + cartId);
    }

    // Verify Payment
    verifyPayment(cartId, paymentInfo): Observable<any> {
        return this.http.post<any>(this.visitorOrderBase + '/checkout/' + cartId, paymentInfo);
    }

}
