import { Routes } from '@angular/router';
import { StaffLoginGuard } from '../guards/staff-login.guard';
import { StaffAuthGuard } from '../guards/staff-auth.guard';

export const StaffRoutes: Routes = [
    {
        path: 'qm-staff/login',
        canActivate: [StaffLoginGuard],
        loadChildren: () => import('./modules/staff-login/staff-login.module')
            .then(mod => mod.StaffLoginModule)
    },
    {
        path: 'qm-staff/orders',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-orders/staff-orders.module')
            .then(mod => mod.StaffOrdersModule)
    },
    {
        path: 'qm-staff/services',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-services/staff-services.module')
            .then(mod => mod.StaffServicesModule)
    },
    {
        path: 'qm-staff/staff',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-staff/staff-staff.module')
            .then(mod => mod.StaffStaffModule)
    },
    {
        path: 'qm-staff/clients',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-clients/staff-clients.module')
            .then(mod => mod.StaffClientsModule)
    },
    {
        path: 'qm-staff/vendors',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-vendors/staff-vendors.module')
            .then(mod => mod.StaffVendorsModule)
    },
    {
        path: 'qm-staff/products',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-products/staff-products.module')
            .then(mod => mod.StaffProductsModule)
    },
    {
        path: 'qm-staff/profile',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-profile/staff-profile.module')
            .then(mod => mod.StaffProfileModule)
    },
    {
        path: 'qm-staff',
        canActivate: [StaffAuthGuard],
        loadChildren: () => import('./modules/staff-dashboard/staff-dashboard.module')
            .then(mod => mod.StaffDashboardModule)
    }
];
