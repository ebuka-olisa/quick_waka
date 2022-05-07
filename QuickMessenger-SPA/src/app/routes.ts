import { StaffRoutes } from './staff/staff-routes';
import { Routes, Route } from '@angular/router';
import { VisitorRoutes } from './visitor/visitor-routes';

export const AppRoutes: Routes = [];


// add staff routes
Array.from(StaffRoutes.values()).forEach((value: Route) => {
    AppRoutes.push(value);
});


// add visitor routes
Array.from(VisitorRoutes.values()).forEach((value: Route) => {
    AppRoutes.push(value);
});
