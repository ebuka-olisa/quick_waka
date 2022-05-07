import { VendorLiteViewModel } from './../../models/vendor';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/models/pagination';
import { map } from 'rxjs/operators';
import { ServiceProductListing } from 'src/app/models/service';
import { CategoryLiteViewModel } from 'src/app/models/category';
import { ProductViewModel } from 'src/app/models/product';

@Injectable()
export class VisitorProductService {

    private visitorServiceBase = environment.Url + 'client/service';
    private visitorProductBase = environment.Url + 'client/product';

    constructor(private http: HttpClient) { }

    // Get Products
    getProducts(serviceNameId: string, filterOptions, pageNumber?: number, itemsPerPage?: number):
    Observable<PaginatedResult<ServiceProductListing>> {
        const paginatedResult = new PaginatedResult<ServiceProductListing>();
        let params = new HttpParams();
        params = params.append('serviceNameId', serviceNameId);
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

        return this.http.post<PaginatedResult<ServiceProductListing>>(this.visitorServiceBase + '/products' , null , { params })
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
    getTopLevelCategories(serviceNameId: string): Observable<CategoryLiteViewModel[]> {
        return this.http.post<CategoryLiteViewModel[]>(this.visitorServiceBase + '/top_prod_categories/' + serviceNameId, null);
    }

    // Get Product
    getProduct(productId: number): Observable<ProductViewModel> {
        return this.http.get<ProductViewModel>(this.visitorProductBase + '/' + productId);
    }



    /*----- SEARCH -----*/
    // Search Products
    searchProducts(filterOptions, pageNumber?: number, itemsPerPage?: number): Observable<PaginatedResult<ServiceProductListing>> {
        const paginatedResult = new PaginatedResult<ServiceProductListing>();
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

        return this.http.post<PaginatedResult<ServiceProductListing>>(this.visitorProductBase , null , { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = {
                    products: response.products,
                    category: response.category,
                    // parentCategories: response.parentCategories,
                    childrenCategories: response.childrenCategories,
                    minPrice: response.minPrice,
                    maxPrice: response.maxPrice,
                    service: { nameId: '', name: ''}
                };
                return paginatedResult;
            })
        );
    }

    // Get Top Level Categories for Search
    getSearchTopLevelCategories(searchTerm: string): Observable<CategoryLiteViewModel[]> {
        return this.http.post<CategoryLiteViewModel[]>(this.visitorProductBase + '/top_prod_categories/' + searchTerm, null);
    }
}
