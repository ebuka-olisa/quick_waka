import { StaffDashboardRoutingModule } from './staff-dashboard-routing.module';
import { NgModule } from '@angular/core';
import { StaffDashboardComponent } from './staff-dashboard.component';
import { StaffSharedModule } from '../staff-shared/staff-shared.module';
import { StaffDashboardService } from './staff-dashboard.service';
import { FusionChartsModule } from 'angular-fusioncharts';

import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';

import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

// Pass the fusioncharts library and chart modules
FusionChartsModule.fcRoot(FusionCharts, Charts, FusionTheme);

@NgModule({
    imports: [
        StaffSharedModule,
        StaffDashboardRoutingModule,
        FusionChartsModule
    ],
    declarations: [
        StaffDashboardComponent
    ],
    providers: [
        StaffDashboardService
    ]
})
export class StaffDashboardModule { }
