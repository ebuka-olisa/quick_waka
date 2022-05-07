import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { LoginUser, UserConfirmEmail, ForgotUserPassword, RegisterUser, UserResetPassword } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class VisitorAccountService {
    private visitorAuthBase = environment.Url + 'client/auth';

    constructor(private http: HttpClient,
                private authService: AuthService) {}

    signIn(user: LoginUser): Observable<LoginUser> {
        return this.http.post<LoginUser>(this.visitorAuthBase + '/login', user)
        .pipe(
            tap((response: any) => {
                if (response) {
                    this.authService.setToken(JSON.stringify(response));
                }
            })
        );
    }

    externalSignIn(token: string, provider: string) {
        return this.http.post(this.visitorAuthBase + '/externallogin', {token, provider})
        .pipe(
            tap((response: any) => {
                if (response) {
                    this.authService.setToken(JSON.stringify(response));
                }
            })
        );
    }

    // Register User
    registerUser(user: RegisterUser): Observable<any> {
        return this.http.post(this.visitorAuthBase + '/register', user);
    }

    // Resend Confirmation Email
    resendConfirmationEmail(user: ForgotUserPassword): Observable<any> {
        return this.http.post(this.visitorAuthBase + '/resendemailconfirmation', user);
    }

    // Confirm Email
    confirmEmail(user: UserConfirmEmail): Observable<any> {
        return this.http.get(this.visitorAuthBase + '/confirmemail?email=' + user.email + '&token=' + user.token);
    }

    // Request Password Reset
    forgotPassword(user: ForgotUserPassword): Observable<any> {
        return this.http.post(this.visitorAuthBase + '/resetpassword', user);
    }

    // Reset Password
    resetPassword(user: UserResetPassword): Observable<any> {
        return this.http.post(this.visitorAuthBase + '/changepassword', user);
    }

}
