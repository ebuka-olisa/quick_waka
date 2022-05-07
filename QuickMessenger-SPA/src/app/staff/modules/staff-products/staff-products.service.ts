import { ServiceListViewModel } from 'src/app/models/service';
import { ProductViewModel } from './../../../models/product';
import { MeasurementMetricViewModel } from '../../../models/measurement-metric';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from 'src/app/models/pagination';
import { Observable } from 'rxjs';
import { ExtraAttributeDetailsViewModel } from 'src/app/models/extra-attributes';
import { map } from 'rxjs/operators';
import { CategoryDetailsViewModel, Property } from 'src/app/models/category';
import { VendorLiteViewModel } from 'src/app/models/vendor';

@Injectable()
export class StaffProductsService {
    private staffProductsBase = environment.Url + 'qm_475/staff/product';
    private staffVendorsBase = environment.Url + 'qm_475/staff/vendor';

    // Category
    ParentCategoriesList: CategoryDetailsViewModel[];
    ExtraAttributesList: ExtraAttributeDetailsViewModel[];
    MeasurementMetricsList: MeasurementMetricViewModel[];

    // Product
    ProductCategoriesList: CategoryDetailsViewModel[];
    ProductVendorsList: VendorLiteViewModel[];
    LastProductCategorySelection: number;
    CategorySelectionPropertyList: Property[];
    ProductServicesList: ServiceListViewModel[];

    constructor(private http: HttpClient) { }


    // PRODUCT
    // Get list of products
    getProductsList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string, deactivated?: string)
    : Observable<PaginatedResult<ProductViewModel[]>> {
        const paginatedResult = new PaginatedResult<ProductViewModel[]>();
        let params = new HttpParams();
        if (deactivated !== null) {
            params = params.append('deactivated', deactivated);
        }
        if (pageNumber !== null) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        if (searchTerm !== null) {
            params = params.append('searchTerm', '' + searchTerm);
        }

        return this.http.get<PaginatedResult<ProductViewModel[]>>(this.staffProductsBase, { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.products;
                return paginatedResult;
            })
        );
    }

    // Get product
    getProduct(product: ProductViewModel): Observable<ProductViewModel> {
        return this.http.get<ProductViewModel>(this.staffProductsBase + '/' + product.id);
    }

    // Create product
    createProduct(product: ProductViewModel): Observable<any> {
        return this.http.post(this.staffProductsBase + '/create', product);
    }

    // Edit product
    editProduct(product: ProductViewModel): Observable<any> {
        return this.http.put(this.staffProductsBase + '/' + product.id + '/update', product);
    }

    // Upload product image
    uploadProductPhoto(productId: number, image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post(this.staffProductsBase + '/' + productId + '/addPhoto', formData);
    }

    // Delete Product
    deleteProduct(product: ProductViewModel): Observable<any> {
        return this.http.delete(this.staffProductsBase + '/' + product.id + '/delete');
    }



    // EXTRA ATTRIBUTES
    // Get list of extra attributes
    getExtraAttributesList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<ExtraAttributeDetailsViewModel[]>> {
        const paginatedResult = new PaginatedResult<ExtraAttributeDetailsViewModel[]>();
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

        return this.http.get<PaginatedResult<ExtraAttributeDetailsViewModel[]>>(this.staffProductsBase + '/propertyTypes', { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.propertyTypes;
                return paginatedResult;
            })
        );
    }

    // Get full list of extra attributes
    getExtraAttributesFullList(): Observable<ExtraAttributeDetailsViewModel[]> {
        return this.http.post<ExtraAttributeDetailsViewModel[]>(this.staffProductsBase + '/propertyTypes', null);
    }

    // Get extra attribute
    getExtraAttribute(attribute: ExtraAttributeDetailsViewModel): Observable<ExtraAttributeDetailsViewModel> {
        return this.http.get<ExtraAttributeDetailsViewModel>(this.staffProductsBase + '/propertyTypes/' + attribute.id);
    }

    // Create extra attribute
    createExtraAttribute(attribute: ExtraAttributeDetailsViewModel): Observable<any> {
        return this.http.post<ExtraAttributeDetailsViewModel>(this.staffProductsBase + '/propertyTypes/create', attribute);
    }

    // Edit extra attribute
    editExtraAttribute(attribute: ExtraAttributeDetailsViewModel): Observable<any> {
        return this.http.put(this.staffProductsBase + '/propertyTypes/' + attribute.id + '/update', attribute);
    }

    // Delete extra attribute
    deleteExtraAttribute(attribute: ExtraAttributeDetailsViewModel): Observable<any> {
        return this.http.delete(this.staffProductsBase + '/propertyTypes/' + attribute.id + '/delete');
    }



    // MEASUREMENT METRICS
    // Get list of extra attributes
    getMeasurementMetricsList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<MeasurementMetricViewModel[]>> {
        const paginatedResult = new PaginatedResult<MeasurementMetricViewModel[]>();
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

        return this.http.get<PaginatedResult<MeasurementMetricViewModel[]>>(this.staffProductsBase + '/measurementTypes', { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.measurementTypes;
                return paginatedResult;
            })
        );
    }

    // Get full list of extra attributes
    getMeasurementMetricsFullList(): Observable<MeasurementMetricViewModel[]> {
        return this.http.post<MeasurementMetricViewModel[]>(this.staffProductsBase + '/measurementTypes', null);
    }

    // Get measurement metric
    getMeasurementMetric(metric: MeasurementMetricViewModel): Observable<MeasurementMetricViewModel> {
        return this.http.get<MeasurementMetricViewModel>(this.staffProductsBase + '/measurementTypes/' + metric.id);
    }

    // Create measurement metric
    createMeasurementMetric(metric: MeasurementMetricViewModel): Observable<any> {
        return this.http.post<MeasurementMetricViewModel>(this.staffProductsBase + '/measurementTypes/create', metric);
    }

    // Edit measurement metric
    editMeasurementMetric(metric: MeasurementMetricViewModel): Observable<any> {
        return this.http.put(this.staffProductsBase + '/measurementTypes/' + metric.id +  '/update', metric);
    }

    // Delete measurement metric
    deleteMeasurementMetric(metric: MeasurementMetricViewModel): Observable<any> {
        return this.http.delete(this.staffProductsBase + '/measurementTypes/' + metric.id + '/delete');
    }



    // CATEGORY
    // Get list of categories
    getCategoriesList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<CategoryDetailsViewModel[]>> {
        const paginatedResult = new PaginatedResult<CategoryDetailsViewModel[]>();
        let params = new HttpParams();
        // params = new HttpParams({ fromObject: { roles } });
        if (pageNumber !== null) {
        params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage !== null) {
        params = params.append('pageSize', '' + itemsPerPage);
        }
        if (searchTerm !== null) {
        params = params.append('searchTerm', '' + searchTerm);
        }

        return this.http.get<PaginatedResult<CategoryDetailsViewModel[]>>(this.staffProductsBase + '/categories', { params })
        .pipe(
        map((response: any) => {
            paginatedResult.pagination = response.pagination;
            paginatedResult.result = response.categories;
            return paginatedResult;
        })
        );
    }

    // Get lite list of all categories
    getCategoriesLiteList(): Observable<CategoryDetailsViewModel[]> {
        return this.http.get<CategoryDetailsViewModel[]>(this.staffProductsBase + '/categories/lite')
        .pipe(
            map((response: any) => {
                return response.categories;
            })
        );
    }

    // Get list of categories for product create/edit
    getAllCategoriesList(): Observable<CategoryDetailsViewModel[]> {
        return this.http.get<CategoryDetailsViewModel[]>(this.staffProductsBase + '/categories/all');
    }

    // Get list of categories that can be parents
    getPotentialParentCategoriesList(): Observable<CategoryDetailsViewModel[]> {
        return this.http.get<CategoryDetailsViewModel[]>(this.staffProductsBase + '/categories/parents');
    }

    // Get category
    getCategory(category: CategoryDetailsViewModel): Observable<CategoryDetailsViewModel> {
        return this.http.get<CategoryDetailsViewModel>(this.staffProductsBase + '/categories/' + category.id);
    }

    // Create category
    createCategory(category: CategoryDetailsViewModel): Observable<any> {
        return this.http.post(this.staffProductsBase + '/categories/create', category);
    }

    // Edit category
    editCategory(category: CategoryDetailsViewModel): Observable<any> {
        return this.http.put(this.staffProductsBase + '/categories/' + category.id + '/update', category);
    }

    // Delete Category
    deleteCategory(category: CategoryDetailsViewModel): Observable<any> {
        return this.http.delete(this.staffProductsBase + '/categories/' + category.id + '/delete');
    }

    // Get category properties
    getCategoryProperties(categoryId: number): Observable<Property[]> {
        return this.http.get<Property[]>(this.staffProductsBase + '/categories/' + categoryId + '/properties');
    }



    // VENDOR
    // Get list of all vendors
    getVendorsList(): Observable<VendorLiteViewModel[]> {
        return this.http.get<VendorLiteViewModel[]>(this.staffVendorsBase + '/lite')
        .pipe(
            map((response: any) => {
                return response.vendors;
            })
        );
    }



    // SERVICE
    // Get list of all services
    getServicesList(): Observable<ServiceListViewModel[]> {
        return this.http.post<ServiceListViewModel[]>(this.staffProductsBase + '/services', null);
        /*.pipe(
            map((response: any) => {
                return response.vendors;
            })
        );*/
    }

}
