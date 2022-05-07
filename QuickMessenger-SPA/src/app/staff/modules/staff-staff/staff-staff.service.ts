import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/models/pagination';
import { StaffViewModel } from 'src/app/models/staff';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class StaffStaffService {
    private staffStaffBase = environment.Url + 'qm_475/staff/staff';

    constructor(private http: HttpClient) { }

    // #region STAFF OPERATIONS
    // Get list of staff
    getStaffList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string, roles?: string[], deactivated?: string)
    : Observable<PaginatedResult<StaffViewModel[]>> {
        const paginatedResult = new PaginatedResult<StaffViewModel[]>();
        let params = new HttpParams();
        if (roles.length === 0) {
            roles = ['Admin', 'FrontDesk', 'Rider'];
        }
        params = new HttpParams({ fromObject: { roles } });
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

        return this.http.get<PaginatedResult<StaffViewModel[]>>(this.staffStaffBase, { params })
        .pipe(
            map((response: any) => {
                paginatedResult.pagination = response.pagination;
                paginatedResult.result = response.staff;
                return paginatedResult;
            })
        );
    }

    // Get staff
    getStaff(staff: StaffViewModel): Observable<StaffViewModel> {
        return this.http.get<StaffViewModel>(this.staffStaffBase + '/staff/' + staff.id);
    }

    // Create staff
    createStaff(staff: StaffViewModel): Observable<any> {
        return this.http.post(this.staffStaffBase + '/create', staff);
    }

    // Edit staff
    editStaff(staff: StaffViewModel): Observable<any> {
        return this.http.put(this.staffStaffBase + '/update', staff);
    }

    // Delete staff
    deleteStaff(staffId: number): Observable<any> {
        return this.http.delete(this.staffStaffBase + '/' + staffId + '/delete');
    }
    //#endregion

    // #region PICTURE OPERATIONS
    // Upload staff image
    uploadStaffPhoto(staffId: number, image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post(this.staffStaffBase + '/' + staffId + '/addPhoto', formData);
    }

    // delete staff image
    deleteStaffPhoto(staffId: number): Observable<any> {
        return this.http.delete(this.staffStaffBase + '/' + staffId + '/deletePhoto');
    }
    // #endregion
}
