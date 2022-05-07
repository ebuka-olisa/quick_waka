import { CanDeactivateGuard } from './../../../guards/deactivate.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffVendorsListComponent } from './staff-vendors-list/staff-vendors-list.component';
import { StaffVendorsModalContainerComponent } from './staff-vendors-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff',
      activePage: 'vendors'
    },
    children: [
      {
        path: '',
        component: StaffVendorsListComponent,
        data: {
          breadcrumb: [{label: 'Vendors', url: ''}],
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: StaffVendorsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Vendors', url: ''}],
              showBackButton: false
            },
            // canDeactivate: [CanDeactivateGuard]
          },
          {
            path: ':id',
            component: StaffVendorsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Vendors', url: ''}],
              showBackButton: false
            },
            // canDeactivate: [CanDeactivateGuard]
          }
        ]
      },
      {
        path: '**',
        component: StaffPageNotFoundComponent,
        data: {
          breadcrumb: [
            {label: 'Vendors', url: '/qm-staff/vendors'},
            {label: 'Page Not Found', url: ''}
          ],
          showBackButton: false
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffVendorsRoutingModule { }
