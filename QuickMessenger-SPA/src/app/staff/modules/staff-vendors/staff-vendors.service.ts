import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/models/pagination';
import { HttpParams, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { VendorViewModel } from 'src/app/models/vendor';

@Injectable()
export class StaffVendorsService {
    private staffVendorBase = environment.Url + 'qm_475/staff/vendor';

    constructor(private http: HttpClient) { }

    // Get list of vendors
    getVendorList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<VendorViewModel[]>> {
        const paginatedResult = new PaginatedResult<VendorViewModel[]>();
        let params = new HttpParams();
        if (pageNumber !== null) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        if (searchTerm !== null) {
            params = params.append('searchTerm', '' + searchTerm);
        }

        return this.http.get<PaginatedResult<VendorViewModel[]>>(this.staffVendorBase, { params })
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.vendors;
                    return paginatedResult;
                })
            );
    }

    // Get vendor
    getVendor(vendor: VendorViewModel): Observable<VendorViewModel> {
        return this.http.get<VendorViewModel>(this.staffVendorBase + '/' + vendor.id);
    }

    // Create vendor
    createVendor(vendor: VendorViewModel): Observable<any> {
        return this.http.post(this.staffVendorBase + '/create', vendor);
    }

    // Edit vendor
    editVendor(vendor: VendorViewModel): Observable<any> {
        return this.http.put(this.staffVendorBase + '/' + vendor.id + '/update', vendor);
    }

    // Delete vendor
    deleteVendor(vendorId: number): Observable<any> {
        return this.http.delete(this.staffVendorBase + '/' + vendorId + '/delete');
    }



    // Upload vendor image
    uploadVendorPhoto(vendorId: number, image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post(this.staffVendorBase + '/' + vendorId + '/addPhoto', formData);
    }

}
