import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { VendorLiteViewModel } from 'src/app/models/vendor';
import { PaginatedResult } from 'src/app/models/pagination';
import { ServiceProductListing } from 'src/app/models/service';
import { map } from 'rxjs/operators';
import { CategoryLiteViewModel } from 'src/app/models/category';

@Injectable()
export class VisitorVendorService {

    private visitorVendorBase = environment.Url + 'client/vendor';

    constructor(private http: HttpClient) { }


    // Get Vendor
    getVendor(vendorId: number): Observable<any> {
        return this.http.get(this.visitorVendorBase + '/' + vendorId);
    }

    // Get Vendor Products
    getProducts(vendorId: number, filterOptions, pageNumber?: number, itemsPerPage?: number, searchTerm?: string):
    Observable<PaginatedResult<ServiceProductListing>> {
        const paginatedResult = new PaginatedResult<ServiceProductListing>();
        let params = new HttpParams();
        params = params.append('vendorId', '' + vendorId);
        if (pageNumber !== null) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        if (filterOptions !== null) {
            for (const key in filterOptions) {
                if (filterOptions.hasOwnProperty(key)) {
                    params = params.append(key, '' + filterOptions[key]);
                }
            }
        }

        return this.http.post<PaginatedResult<ServiceProductListing>>(this.visitorVendorBase + '/products' , null , { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = {
                    products: response.products,
                    category: response.category,
                    childrenCategories: response.childrenCategories,
                    minPrice: response.minPrice,
                    maxPrice: response.maxPrice,
                    service: { nameId: '', name: ''}
                };
                return paginatedResult;
            })
        );
    }

    // Get Top Level Categories
    getTopLevelCategories(vendorId: number): Observable<CategoryLiteViewModel[]> {
        return this.http.post<CategoryLiteViewModel[]>(this.visitorVendorBase + '/top_prod_categories/' + vendorId, null);
    }

    // Get Vendors
    getVendors(pageNumber?: number, itemsPerPage?: number): Observable<PaginatedResult<VendorLiteViewModel[]>> {
        const paginatedResult = new PaginatedResult<VendorLiteViewModel[]>();
        let params = new HttpParams();
        if (pageNumber !== null) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        return this.http.post<PaginatedResult<VendorLiteViewModel[]>>(this.visitorVendorBase, null , { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.vendors;
                return paginatedResult;
            })
        );
    }

    // Search Vendors
    searchVendors(filterOptions, pageNumber?: number, itemsPerPage?: number): Observable<PaginatedResult<VendorLiteViewModel[]>> {
        const paginatedResult = new PaginatedResult<VendorLiteViewModel[]>();
        let params = new HttpParams();
        if (pageNumber !== null) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        if (filterOptions !== null) {
            for (const key in filterOptions) {
                if (filterOptions.hasOwnProperty(key)) {
                    params = params.append(key, '' + filterOptions[key]);
                }
            }
        }

        return this.http.post<PaginatedResult<VendorLiteViewModel[]>>(this.visitorVendorBase , null , { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.vendors;
                return paginatedResult;
            })
        );
    }

}
