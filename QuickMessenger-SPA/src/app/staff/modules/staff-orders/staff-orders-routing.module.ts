import { StaffOrdersModalContainerComponent } from './staff-orders-modal-container.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffOrdersListComponent } from './staff-orders-list/staff-orders-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff',
      activePage: 'orders'
    },
    children: [
      {
        path: '',
        component: StaffOrdersListComponent,
        data: {
          breadcrumb: [{label: 'Orders', url: ''}],
          showBackButton: false
        },
        children: [
          {
            path: ':id',
            component: StaffOrdersModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Orders', url: ''}],
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
            {label: 'Clients', url: '/qm-staff/orders'},
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
export class StaffOrdersRoutingModule { }
