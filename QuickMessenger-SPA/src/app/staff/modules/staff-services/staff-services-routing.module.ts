import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffServicesListComponent } from './staff-services-list/staff-services-list.component';
import { StaffServicesModalContainerComponent } from './staff-services-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff',
      activePage: 'services'
    },
    children: [
      {
        path: '',
        component: StaffServicesListComponent,
        data: {
          breadcrumb: [{label: 'Services', url: ''}],
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: StaffServicesModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Services', url: ''}],
              showBackButton: false
            },
            // canDeactivate: [CanDeactivateGuard]
          },
          {
            path: ':id',
            component: StaffServicesModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Services', url: ''}],
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
            {label: 'Services', url: '/qm-staff/services'},
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
export class StaffServicesRoutingModule { }
