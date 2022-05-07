import { ServiceViewModel } from './../../../models/service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceListViewModel } from 'src/app/models/service';
import { PaginatedResult } from 'src/app/models/pagination';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class StaffServicesService {

    private staffServiceBase = environment.Url + 'qm_475/staff/product';

    constructor(private http: HttpClient) { }

    // Get list of services
    getServicesList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<ServiceListViewModel[]>> {
        const paginatedResult = new PaginatedResult<ServiceListViewModel[]>();
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

        return this.http.get<PaginatedResult<ServiceListViewModel[]>>(this.staffServiceBase + '/services', { params })
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.categories;
                    return paginatedResult;
                })
            );
    }

    // Get service
    getService(service: ServiceViewModel): Observable<ServiceViewModel> {
        return this.http.get<ServiceViewModel>(this.staffServiceBase + '/services/' + service.id);
    }

    // Create service
    createService(service: ServiceViewModel): Observable<any> {
        return this.http.post(this.staffServiceBase + '/service/create', service);
    }

    // Edit service
    editService(service: ServiceViewModel): Observable<any> {
        return this.http.put(this.staffServiceBase + '/services/' + service.id + '/update', service);
    }

    // Delete service
    deleteService(serviceId: number): Observable<any> {
        return this.http.delete(this.staffServiceBase + '/services/' + serviceId + '/delete');
    }


    // PICTURES
    // Upload service image
    uploadServicePhoto(productId: number, image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post(this.staffServiceBase + '/service/' + productId + '/addPhoto', formData);
    }

}
