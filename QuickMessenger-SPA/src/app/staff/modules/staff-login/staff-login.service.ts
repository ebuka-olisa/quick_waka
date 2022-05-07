import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LoginUser } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class StaffLoginService {
  private staffAuthBase = environment.Url + 'qm_475/staff/auth';

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  signIn(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>(this.staffAuthBase + '/login', user)
    .pipe(
      tap((response: any) => {
        if (response) {
          this.authService.setToken(JSON.stringify(response));
        }
      })
    );
  }

}
