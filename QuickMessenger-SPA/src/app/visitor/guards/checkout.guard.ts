import { VisitorCartService } from './../services/visitor-cart.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class CheckoutGuard implements CanActivate {

    constructor(private router: Router,
                private authService: AuthService,
                private cartService: VisitorCartService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        // check if user has cart
        const Cart = this.cartService.getCart();
        if (!Cart || !Cart.serviceOrders || Cart.serviceOrders.length === 0) {
            this.router.navigate(['cart']);
            return false;
        }


        // check if the user is logged in
        if (this.authService.isUserloggedIn()) {
            return true;
        }

        // not logged in so redirect to login page with return url
        this.authService.logout();
        this.router.navigate(['account/signin'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
