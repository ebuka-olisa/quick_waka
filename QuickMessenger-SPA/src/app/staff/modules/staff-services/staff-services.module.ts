import { StaffServicesService } from './staff-services.service';
import { StaffSharedModule } from './../staff-shared/staff-shared.module';
import { StaffServicesRoutingModule } from './staff-services-routing.module';
import { NgModule } from '@angular/core';
import { StaffServicesListComponent } from './staff-services-list/staff-services-list.component';
import { StaffServicesAddComponent } from './staff-services-add/staff-services-add.component';
import { StaffServicesModalContainerComponent } from './staff-services-modal-container.component';

@NgModule({
  imports: [
    StaffServicesRoutingModule,
    StaffSharedModule
  ],
  declarations: [
    StaffServicesListComponent,
    StaffServicesAddComponent,
    StaffServicesModalContainerComponent
  ],
  providers: [
    StaffServicesService
  ],
  entryComponents: [
    StaffServicesAddComponent
  ]
})
export class StaffServicesModule { }

