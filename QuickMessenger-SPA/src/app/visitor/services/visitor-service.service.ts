import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ServiceListViewModel, ServiceViewModel } from 'src/app/models/service';

@Injectable()
export class VisitorServiceService {

    private visitorServiceBase = environment.Url + 'client/service';

    constructor(private http: HttpClient) { }

    getService(serviceNameId: string): Observable<ServiceListViewModel> {
        return this.http.post<ServiceListViewModel>(this.visitorServiceBase + '/' + serviceNameId, null);
    }

    getDefaultGenericService(): Observable<ServiceViewModel> {
        return this.http.post<ServiceViewModel>(this.visitorServiceBase + '/defaultGeneric', null);
    }

}
