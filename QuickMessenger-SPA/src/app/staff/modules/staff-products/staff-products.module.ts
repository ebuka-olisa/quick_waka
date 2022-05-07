import { StaffProductsModalContainerComponent } from './staff-products-modal-container.component';
import { StaffProductsCategoriesModalContainerComponent } from './staff-products-categories-modal-container.component';
import { StaffProductsExtraAttributesModalContainerComponent } from './staff-products-extra-attributes-modal-container.component';
import { StaffProductsMeasurementMetricsModalContainerComponent } from './staff-products-measurement-metrics-modal-container.component';
import { StaffProductsExtraAttributesSelectComponent } from './staff-products-extra-attributes-select/staff-products-extra-attributes-select.component';
import { StaffProductsCategoryAddComponent } from './staff-products-category-add/staff-products-category-add.component';
import { StaffProductsExtraAttributesListComponent } from './staff-products-extra-attributes-list/staff-products-extra-attributes-list.component';
import { NgModule } from '@angular/core';

import { StaffProductsRoutingModule } from './staff-products-routing.module';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffProductsCategoriesListComponent } from './staff-products-categories-list/staff-products-categories-list.component';
import { StaffProductsListComponent } from './staff-products-list/staff-products-list.component';
import { StaffProductsExtraAttributesAddComponent } from './staff-products-extra-attributes-add/staff-products-extra-attributes-add.component';
import { StaffProductsMeasurementMetricsListComponent } from './staff-products-measurement-metrics-list/staff-products-measurement-metrics-list.component';
import { StaffProductsMeasurementMetricsAddComponent } from './staff-products-measurement-metrics-add/staff-products-measurement-metrics-add.component';
import { StaffProductsMeasurementMetricsSelectComponent } from './staff-products-measurement-metrics-select/staff-products-measurement-metrics-select.component';
import { StaffProductsAddComponent } from './staff-products-add/staff-products-add.component';
import { StaffProductsService } from './staff-products.service';

@NgModule({
    imports: [
        StaffProductsRoutingModule,
        StaffSharedModule
    ],
    declarations: [
        StaffProductsCategoriesListComponent,
        StaffProductsListComponent,
        StaffProductsExtraAttributesListComponent,
        StaffProductsExtraAttributesAddComponent,
        StaffProductsCategoryAddComponent,
        StaffProductsMeasurementMetricsListComponent,
        StaffProductsMeasurementMetricsAddComponent,
        StaffProductsExtraAttributesSelectComponent,
        StaffProductsMeasurementMetricsSelectComponent,
        StaffProductsAddComponent,
        StaffProductsMeasurementMetricsModalContainerComponent,
        StaffProductsExtraAttributesModalContainerComponent,
        StaffProductsCategoriesModalContainerComponent,
        StaffProductsModalContainerComponent
    ],
    providers: [
        StaffProductsService
    ],
    entryComponents: [
        StaffProductsExtraAttributesAddComponent,
        StaffProductsCategoryAddComponent,
        StaffProductsMeasurementMetricsAddComponent,
        StaffProductsExtraAttributesSelectComponent,
        StaffProductsMeasurementMetricsSelectComponent,
        StaffProductsAddComponent
    ]
})
export class StaffProductsModule { }
