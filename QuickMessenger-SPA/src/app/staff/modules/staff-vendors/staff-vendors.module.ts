import { StaffVendorsModalContainerComponent } from './staff-vendors-modal-container.component';
import { NgModule } from '@angular/core';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffVendorsRoutingModule } from './staff-vendors-routing.module';
import { StaffVendorsListComponent } from './staff-vendors-list/staff-vendors-list.component';
import { StaffVendorsService } from './staff-vendors.service';
import { StaffVendorsAddComponent } from './staff-vendors-add/staff-vendors-add.component';

@NgModule({
    imports: [
        StaffVendorsRoutingModule,
        StaffSharedModule
    ],
    providers: [
        StaffVendorsService
    ],
    declarations: [
        StaffVendorsListComponent,
        StaffVendorsAddComponent,
        StaffVendorsModalContainerComponent
    ],
    entryComponents: [
        StaffVendorsAddComponent
    ]
})
export class StaffVendorsModule { }
