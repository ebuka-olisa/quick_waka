import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffLoginLayoutComponent } from './components/staff-login-layout/staff-login-layout.component';
import { StaffLoginComponent } from './components/staff-login/staff-login.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLoginLayoutComponent,
    data: { home: '/qm-staff/login'},
    children: [
      {
        path: '', component: StaffLoginComponent
      },
      {
        path: '**',
        component: StaffPageNotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffLoginRoutingModule { }
