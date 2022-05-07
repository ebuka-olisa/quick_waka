import { StaffStaffModalContainerComponent } from './staff-staff-modal-container.component';
import { StaffStaffService } from './staff-staff.service';
import { StaffStaffRoutingModule } from './staff-staff-routing.module';
import { NgModule } from '@angular/core';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffStaffListComponent } from './staff-staff-list/staff-staff-list.component';
import { StaffStaffAddComponent } from './staff-staff-add/staff-staff-add.component';

@NgModule({
  imports: [
    StaffStaffRoutingModule,
    StaffSharedModule
  ],
  providers: [
    StaffStaffService
  ],
  declarations: [
    StaffStaffListComponent,
    StaffStaffAddComponent,
    StaffStaffModalContainerComponent
  ],
  entryComponents: [StaffStaffAddComponent]
})
export class StaffStaffModule { }
