import { OrderListViewModel, OrderViewModel, OrderUpdateViewModel } from './../../../models/order';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/models/pagination';
import { map } from 'rxjs/operators';
import { RiderLiteViewModel } from 'src/app/models/staff';

@Injectable()
export class StaffOrdersService {
    private staffOrdersBase = environment.Url + 'qm_475/staff/order';
    private staffStaffBase = environment.Url + 'qm_475/staff/staff';

    OrderRidersList: RiderLiteViewModel[];

    constructor(private http: HttpClient) { }

    // ORDER
    // Get list of orders
    getOrdersList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string, type?: string, states?: string[])
    : Observable<PaginatedResult<OrderListViewModel[]>> {
        const paginatedResult = new PaginatedResult<OrderListViewModel[]>();
        let params = new HttpParams();
        params = new HttpParams({ fromObject: { states } });
        if (type !== null) {
            params = params.append('type', '' + type);
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

        return this.http.get<PaginatedResult<OrderListViewModel[]>>(this.staffOrdersBase, { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.orders;
                return paginatedResult;
            })
        );
    }

    // Get order
    getOrder(order: OrderViewModel): Observable<OrderViewModel> {
        return this.http.get<OrderViewModel>(this.staffOrdersBase + '/' + order.id);
    }

    // Edit order
    editOrder(order: OrderUpdateViewModel): Observable<any> {
        return this.http.put(this.staffOrdersBase + '/' + order.id + '/update', order);
    }


    // VENDOR
    // Get list of all riders
    getRidersList(): Observable<RiderLiteViewModel[]> {
        return this.http.get<RiderLiteViewModel[]>(this.staffStaffBase + '/riders/lite');
    }

}
