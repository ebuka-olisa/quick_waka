import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component';
import { MultiplePicsComponent } from './components/multiple-pics/multiple-pics.component';
import { ShowInfoComponent } from './components/show-info/show-info.component';
import { MyPaginationComponent } from './components/my-pagination/my-pagination.component';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ConfirmExitComponent } from './components/confirm-exit/confirm-exit.component';
import { ProfilePicComponent } from './components/profile-pic/profile-pic.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BsDropdownModule, PaginationModule, TabsModule, DatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { InterceptorProviders } from '../interceptors/interceptor-providers';
import { Ng7BootstrapBreadcrumbModule } from 'ng7-bootstrap-breadcrumb';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { DropzoneConfigInterface, DROPZONE_CONFIG, DropzoneModule } from 'ngx-dropzone-wrapper';
import { NgbModalModule, NgbCollapseModule, NgbTooltipModule, NgbPaginationModule, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Ng5SliderModule } from 'ng5-slider';
import { DatetimePopupModule } from 'ngx-bootstrap-datetime-popup';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: '/post',
  acceptedFiles: 'image/*',
  uploadMultiple: false,
  maxFiles: 1,
  clickable: true,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictDefaultMessage: 'Drop picture here or click'
};

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ToastrModule.forRoot({
      maxOpened: 2,
      positionClass: 'toast-top-right',
      timeOut: 4000,
      closeButton: true,
      preventDuplicates: true,
      enableHtml: true
    }),
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    DatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    DatetimePopupModule.forRoot(),
    Ng2TelInputModule,
    FormsModule,
    Ng7BootstrapBreadcrumbModule,
    DropzoneModule,
    NgbModalModule,
    NgbCollapseModule,
    NgbTooltipModule,
    NgbPaginationModule,
    NgbTabsetModule,
    InfiniteScrollModule,
    Ng5SliderModule
  ],
  exports : [
    CommonModule,
    BsDropdownModule,
    PaginationModule,
    TabsModule,
    DatepickerModule,
    TimepickerModule,
    DatetimePopupModule,
    FormsModule,
    Ng7BootstrapBreadcrumbModule,
    Ng2TelInputModule,
    DropzoneModule,
    NgbModalModule,
    NgbCollapseModule,
    ProfilePicComponent,
    MultiplePicsComponent,
    NgbTooltipModule,
    NgbPaginationModule,
    MyPaginationComponent,
    NgbTabsetModule,
    InfiniteScrollModule,
    Ng5SliderModule
  ],
  declarations: [
    ProfilePicComponent,
    ConfirmExitComponent,
    ConfirmDeleteComponent,
    ConfirmActionComponent,
    MyPaginationComponent,
    ShowInfoComponent,
    MultiplePicsComponent,
    ModalContainerComponent
  ],
  providers: [
    InterceptorProviders,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  entryComponents: [
    ConfirmExitComponent,
    ConfirmDeleteComponent,
    ConfirmActionComponent,
    ShowInfoComponent
  ]
})
export class SharedModule { }
