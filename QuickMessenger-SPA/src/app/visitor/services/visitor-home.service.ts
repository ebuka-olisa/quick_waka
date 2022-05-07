import { ContactMessage } from 'src/app/models/message';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomePageItems } from 'src/app/models/page-extras';

@Injectable()
export class VisitorHomeService {
    private visitorHomeBase = environment.Url + 'client/home';

    constructor(private http: HttpClient) { }

    // Get home page items
    getHomePageItems(): Observable<HomePageItems> {
        return this.http.get<HomePageItems>(this.visitorHomeBase);
    }

    // Send Contact Us Message
    mailQuickWaka(message: ContactMessage): Observable<any> {
        return this.http.post<any>(this.visitorHomeBase + '/contact', message);
    }

}
