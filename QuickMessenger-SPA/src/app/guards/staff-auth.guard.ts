import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StaffAuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isStaffloggedIn()) {
        return true;
    }

    // not logged in so redirect to login page with return url
    this.authService.logout();
    this.router.navigate(['qm-staff/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
