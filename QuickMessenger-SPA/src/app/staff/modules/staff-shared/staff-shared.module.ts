import { PageWrapperDirective } from './directives/page-wrapper.directive';
import { StaffLayoutComponent } from './components/staff-layout/staff-layout.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgModule } from '@angular/core';
import { StaffPageNotFoundComponent } from './components/staff-page-not-found/staff-page-not-found.component';
import { RouterModule } from '@angular/router';
import { NgxTinymceModule } from 'ngx-tinymce';
import { NgSelectizeModule } from 'ng-selectize';

@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    NgxTinymceModule.forRoot({
      baseURL: './assets/tinymce/'
      // baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.0/',
    }),
    NgSelectizeModule
  ],
  exports: [
    SharedModule,
    NgxTinymceModule,
    NgSelectizeModule
  ],
  declarations: [
    StaffPageNotFoundComponent,
    StaffLayoutComponent,
    PageWrapperDirective
  ]
})
export class StaffSharedModule { }
