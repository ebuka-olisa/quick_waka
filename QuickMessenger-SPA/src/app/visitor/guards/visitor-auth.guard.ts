import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class VisitorAuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (this.authService.isUserloggedIn()) {
          return true;
      }

      // not logged in so redirect to login page with return url
      this.authService.logout();
      this.router.navigate(['account/signin'], { queryParams: { returnUrl: state.url }});
      return false;
    }
}
