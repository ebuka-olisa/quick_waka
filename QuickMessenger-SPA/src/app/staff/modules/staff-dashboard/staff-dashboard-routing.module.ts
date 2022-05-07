import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';

const routes: Routes = [
    {
        path: '',
        component: StaffLayoutComponent,
        data: {
            home: '/qm-staff',
            activePage: 'dashboard'
        },
        children: [
        {
            path: '',
            component: StaffDashboardComponent,
            data: {
            breadcrumb: [{label: 'Dashboard', url: ''}],
            showBackButton: false
            },
            resolve: {}
        },
        {
            path: '**',
            component: StaffPageNotFoundComponent,
            data: {
            breadcrumb: [
                {label: 'Dashboard', url: '/qm-staff'},
                {label: 'Page Not Found', url: ''}
            ]
            }
        }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StaffDashboardRoutingModule { }
