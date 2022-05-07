import { EditUser, MyUser } from './../models/user';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private jwtHelper: JwtHelperService;
    private currentUser: MyUser;

    // userInfoUpdate: EventEmitter<any> = new EventEmitter();

    constructor() { this.jwtHelper = new JwtHelperService(); }

    // Token
    setToken(tokenString: string) {
        localStorage.setItem('user', tokenString);
    }

    getToken(): string {
        return this.getUserAndToken() ? this.getUserAndToken().token : '';
    }


    // User
    getUser(): MyUser {
        // if (!this.currentUser) {
        const userAndToken = this.getUserAndToken();
        if (userAndToken) {
            // this.currentUser = new MyUser(userAndToken);
            return new MyUser(userAndToken);
        }
        return null;
        // }
        // return this.currentUser;
    }

    editUser(user: EditUser) {
        const userAndToken = this.getUserAndToken();
        userAndToken.user.lastName = user.lastName;
        userAndToken.user.firstName = user.firstName;
        userAndToken.user.gender = user.gender;
        userAndToken.user.email = user.email;
        this.setToken(JSON.stringify(userAndToken));
    }

    clearCurrentUser() {
        this.currentUser = null;
    }

    private getUserAndToken(): TokenUser {
        return JSON.parse(localStorage.getItem('user')) as TokenUser;
    }

    isStaffloggedIn() {
        const token = this.getUserAndToken() ? (this.getUserAndToken().token ? this.getUserAndToken().token : null) : null;
        if (token) {
            if (!this.jwtHelper.isTokenExpired(token)) {
                const decodedToken = this.jwtHelper.decodeToken(token);
                if (decodedToken.user_type === 'Staff') { return true; }
                return false;
            }
        }

        return false;
    }

    isUserloggedIn() {
        const token = this.getUserAndToken() ? (this.getUserAndToken().token ? this.getUserAndToken().token : null) : null;
        if (token) {
            return true;
        }

        return false;
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        this.clearCurrentUser();
    }
}
