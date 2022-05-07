import { NgModule } from '@angular/core';
import { StaffLoginService } from './staff-login.service';
import { StaffLoginRoutingModule } from './staff-login-routing.module';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffLoginLayoutComponent } from './components/staff-login-layout/staff-login-layout.component';
import { StaffLoginComponent } from './components/staff-login/staff-login.component';

@NgModule({
  imports: [
    StaffSharedModule,
    StaffLoginRoutingModule
  ],
  declarations: [
    StaffLoginLayoutComponent,
    StaffLoginComponent
  ],
  providers: [
    StaffLoginService
  ]
})
export class StaffLoginModule { }
