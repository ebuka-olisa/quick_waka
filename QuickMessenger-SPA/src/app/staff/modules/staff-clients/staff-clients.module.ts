import { StaffClientsModalContainerComponent } from './staff-clients-modal-container.component';
import { NgModule } from '@angular/core';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffClientsListComponent } from './staff-clients-list/staff-clients-list.component';
import { StaffClientsRoutingModule } from './staff-clients-routing.module';
import { StaffClientsService } from './staff-clients.service';
import { StaffClientsAddComponent } from './staff-clients-add/staff-clients-add.component';

@NgModule({
  imports: [
    StaffClientsRoutingModule,
    StaffSharedModule
  ],
  providers: [
    StaffClientsService
  ],
  declarations: [
    StaffClientsListComponent,
    StaffClientsAddComponent,
    StaffClientsModalContainerComponent
  ],
  entryComponents: [
    StaffClientsAddComponent
  ]
})
export class StaffClientsModule { }
