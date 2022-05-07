import { StaffClientsModalContainerComponent } from './staff-clients-modal-container.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffClientsListComponent } from './staff-clients-list/staff-clients-list.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff',
      activePage: 'clients'
    },
    children: [
      {
        path: '',
        component: StaffClientsListComponent,
        data: {
          breadcrumb: [{label: 'Clients', url: ''}],
          showBackButton: false
        },
        children: [
          {
            path: ':id',
            component: StaffClientsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Clients', url: ''}],
              showBackButton: false
            },
          }
        ]
      },
      {
        path: '**',
        component: StaffPageNotFoundComponent,
        data: {
          breadcrumb: [
            {label: 'Clients', url: '/qm-staff/clients'},
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
export class StaffClientsRoutingModule { }
