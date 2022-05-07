import { StaffProfileResolver } from './resolvers/staff-profile.resolver';
import { StaffProfileRoutingModule } from './staff-profile-routing.module';
import { StaffProfileService } from './staff-profile.service';
import { NgModule } from '@angular/core';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffProfileLayoutComponent } from './staff-profile-layout/staff-profile-layout.component';
import { StaffProfileEditComponent } from './staff-profile-edit/staff-profile-edit.component';
import { StaffProfileContactEditComponent } from './staff-profile-contact-edit/staff-profile-contact-edit.component';
import { StaffProfileChangePasswordComponent } from './staff-profile-change-password/staff-profile-change-password.component';

@NgModule({
    imports: [
        StaffSharedModule,
        StaffProfileRoutingModule
    ],
    providers: [
        StaffProfileService,
        StaffProfileResolver
    ],
    declarations: [
        StaffProfileLayoutComponent,
        StaffProfileEditComponent,
        StaffProfileContactEditComponent,
        StaffProfileChangePasswordComponent
    ],
    entryComponents: []
})
export class StaffProfileModule { }
