import { ManageUserPassword } from 'src/app/models/user';
import { MyUser } from './../../../models/user';
import { StaffViewModel } from 'src/app/models/staff';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

@Injectable()
export class StaffProfileService {
    private staffStaffBase = environment.Url + 'qm_475/staff/staff';
    private staffAuthBase = environment.Url + 'qm_475/staff/auth';

    constructor(private http: HttpClient) { }

    // PROFILE
    // Get current user
    getStaffProfile(user: MyUser): Observable<StaffViewModel> {
        return this.http.get<StaffViewModel>(this.staffStaffBase + '/staff/' + user.id);
    }

    // Edit staff
    editProfile(staff: StaffViewModel): Observable<any> {
        return this.http.put(this.staffStaffBase + '/update', staff)
        .pipe(
            concatMap(() => this.http.post(this.staffAuthBase + '/renewToken', null))
        );
    }

    // Renew Token
    renewToken(): Observable<any> {
        return this.http.get(this.staffAuthBase + '/renewToken');
    }


    // PASSWORD
    // Edit staff
    changePassword(userPassword: ManageUserPassword): Observable<any> {
        return this.http.put(this.staffStaffBase + '/' + userPassword.id + '/updatePassword', userPassword);
    }


    // PICTURE OPERATIONS
    // Upload staff image
    uploadUserPhoto(userId: number, image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post(this.staffStaffBase + '/' + userId + '/addPhoto', formData)
            .pipe(
                concatMap((response) => this.http.post(this.staffAuthBase + '/renewToken', null)
                .pipe(map((response2) => {
                    const value = {
                        response1: response,
                        response2
                    };
                    return value;
                })))
            );
    }

    // delete staff image
    deleteUserPhoto(userId: number): Observable<any> {
        return this.http.delete(this.staffStaffBase + '/' + userId + '/deletePhoto')
        .pipe(
            concatMap(() => this.http.post(this.staffAuthBase + '/renewToken', null))
        );
    }
    // #endregion
}
