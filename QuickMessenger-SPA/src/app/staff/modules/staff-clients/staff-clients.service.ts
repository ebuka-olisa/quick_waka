import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/models/pagination';
import { HttpParams, HttpClient } from '@angular/common/http';
import { ClientViewModel } from 'src/app/models/client';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StaffClientsService {

    private staffClientsBase = environment.Url + 'qm_475/staff/client';

    constructor(private http: HttpClient) { }


    // CLIENTS
    // Get list of clients
    getClientList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string, deactivated?: string)
    : Observable<PaginatedResult<ClientViewModel[]>> {
        const paginatedResult = new PaginatedResult<ClientViewModel[]>();
        let params = new HttpParams();
        if (deactivated !== null) {
            params = params.append('deactivated', '' + deactivated);
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

        return this.http.get<PaginatedResult<ClientViewModel[]>>(this.staffClientsBase, { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.clients;
                return paginatedResult;
            })
        );
    }

    // Get client
    getClient(client: ClientViewModel): Observable<ClientViewModel> {
        return this.http.get<ClientViewModel>(this.staffClientsBase + '/' + client.id);
    }

    // Deactivate client
    deactivateClient(client: ClientViewModel): Observable<any> {
        return this.http.put(this.staffClientsBase + '/' + client.id + '/deactivate', null);
    }

    // Activate client
    activateClient(client: ClientViewModel): Observable<any> {
        return this.http.put(this.staffClientsBase + '/' + client.id + '/activate', null);
    }

}
