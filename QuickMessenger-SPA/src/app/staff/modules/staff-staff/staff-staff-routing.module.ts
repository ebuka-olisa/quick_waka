import { StaffStaffModalContainerComponent } from './staff-staff-modal-container.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffStaffListComponent } from './staff-staff-list/staff-staff-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff',
      activePage: 'staff'
    },
    children: [
      {
        path: '',
        component: StaffStaffListComponent,
        data: {
          breadcrumb: [{label: 'Staff', url: ''}],
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: StaffStaffModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Staff', url: ''}],
              showBackButton: false
            }
          },
          {
            path: ':id',
            component: StaffStaffModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Staff', url: ''}],
              showBackButton: false
            }
          }
        ]
      },
      {
        path: '**',
        component: StaffPageNotFoundComponent,
        data: {
          breadcrumb: [
            {label: 'Staff', url: '/qm-staff/staff'},
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
export class StaffStaffRoutingModule { }
