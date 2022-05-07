import { StaffProfileResolver } from './resolvers/staff-profile.resolver';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffProfileLayoutComponent } from './staff-profile-layout/staff-profile-layout.component';
import { StaffProfileEditComponent } from './staff-profile-edit/staff-profile-edit.component';
import { StaffProfileContactEditComponent } from './staff-profile-contact-edit/staff-profile-contact-edit.component';
import { StaffProfileChangePasswordComponent } from './staff-profile-change-password/staff-profile-change-password.component';

const routes: Routes = [
    {
        path: '',
        component: StaffLayoutComponent,
        data: {
            home: '/qm-staff'
        },
        children: [
            {
                path: '',
                component: StaffProfileLayoutComponent,
                resolve: {
                    user: StaffProfileResolver
                },
                children: [
                    {
                        path: '',
                        component: StaffProfileEditComponent,
                        data: {
                            activeView: 'basic',
                            showBackButton: false,
                            breadcrumb: [
                                {label: 'Profile', url: ''},
                            ],
                        },
                    },
                    {
                        path: 'contact',
                        component: StaffProfileContactEditComponent,
                        data: {
                            activeView: 'contact',
                            showBackButton: false,
                            breadcrumb: [
                                {label: 'Profile', url: '/qm-staff/profile'},
                                {label: 'Contact', url: ''}
                            ],
                        },
                    },
                    {
                        path: 'change_password',
                        component: StaffProfileChangePasswordComponent,
                        data: {
                            activeView: 'change_password',
                            showBackButton: false,
                            breadcrumb: [
                                {label: 'Profile', url: '/qm-staff/profile'},
                                {label: 'Change Password', url: ''}
                            ],
                        },
                    },
                    {
                        path: '**',
                        component: StaffPageNotFoundComponent,
                        data: {
                            breadcrumb: [
                                {label: 'Profile', url: '/qm-staff/profile'},
                                {label: 'Page Not Found', url: ''}
                            ],
                            showBackButton: false
                        }
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StaffProfileRoutingModule { }
