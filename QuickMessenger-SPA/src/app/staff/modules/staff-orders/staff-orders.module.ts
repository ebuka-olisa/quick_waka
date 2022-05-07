import { StaffOrdersModalContainerComponent } from './staff-orders-modal-container.component';
import { StaffOrdersEditComponent } from './staff-orders-edit/staff-orders-edit.component';
import { StaffOrdersListComponent } from './staff-orders-list/staff-orders-list.component';
import { NgModule } from '@angular/core';
import { StaffOrdersRoutingModule } from './staff-orders-routing.module';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffOrdersService } from './staff-orders.service';

@NgModule({
  imports: [
    StaffOrdersRoutingModule,
    StaffSharedModule
  ],
  providers: [
    StaffOrdersService
  ],
  declarations: [
    StaffOrdersListComponent,
    StaffOrdersEditComponent,
    StaffOrdersModalContainerComponent
  ],
  entryComponents: [
    StaffOrdersEditComponent
  ]
})
export class StaffOrdersModule { }
