import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceLiteViewModel } from 'src/app/models/service';

@Injectable()
export class VisitorGeneralService {

    private visitorBase = environment.Url + 'client/service';

    constructor(private http: HttpClient) { }

    // Get All Services
    getAllServices(): Observable<ServiceLiteViewModel[]> {
        return this.http.post<ServiceLiteViewModel[]>(this.visitorBase + '/all/lite', null);
    }

}
