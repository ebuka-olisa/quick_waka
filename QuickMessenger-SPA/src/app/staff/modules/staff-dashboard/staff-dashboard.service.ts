import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderStatsKPIViewModel, OrderChartTodayKPIViewModel, DashboardCityListKPIViewModel, DashboardProductListKPIViewModel, DashboardVendorListKPIViewModel, DashboardRiderListKPIViewModel } from 'src/app/models/staff-dashboard';

@Injectable()
export class StaffDashboardService {
    private staffDashboardBase = environment.Url + 'qm_475/staff/dashboard';

    constructor(private http: HttpClient) { }

    // CARD
    // get order stats for today
    getTodayOrderStats(): Observable<OrderStatsKPIViewModel> {
        return this.http.get<OrderStatsKPIViewModel>(this.staffDashboardBase + '/order/card/today');
    }

    // get order stats for this week
    getThisWeekOrderStats(): Observable<OrderStatsKPIViewModel> {
        return this.http.get<OrderStatsKPIViewModel>(this.staffDashboardBase + '/order/card/thisweek');
    }

    // get order stats for this month
    getThisMonthOrderStats(): Observable<OrderStatsKPIViewModel> {
        return this.http.get<OrderStatsKPIViewModel>(this.staffDashboardBase + '/order/card/thismonth');
    }



    // CHARTS
    // get order chart reports for today
    getTodayOrderCharts(): Observable<OrderChartTodayKPIViewModel[]> {
        return this.http.get<OrderChartTodayKPIViewModel[]>(this.staffDashboardBase + '/order/chart/today');
    }

    // get order chart reports for this week
    getThisWeekOrderCharts(): Observable<OrderStatsKPIViewModel[]> {
        return this.http.get<OrderStatsKPIViewModel[]>(this.staffDashboardBase + '/order/chart/thisweek');
    }

    // get order chart reports for this month
    getThisMonthOrderCharts(): Observable<OrderStatsKPIViewModel[]> {
        return this.http.get<OrderStatsKPIViewModel[]>(this.staffDashboardBase + '/order/chart/thismonth');
    }



    // LIST
    // PRODUCT
    // get order stats for today
    getTodayProductList(): Observable<DashboardProductListKPIViewModel> {
        return this.http.get<DashboardProductListKPIViewModel>(this.staffDashboardBase + '/order/list/product/today');
    }

    // get order stats for this week
    getThisWeekProductList(): Observable<DashboardProductListKPIViewModel> {
        return this.http.get<DashboardProductListKPIViewModel>(this.staffDashboardBase + '/order/list/product/thisweek');
    }

    // get order stats for this month
    getThisMonthProductList(): Observable<DashboardProductListKPIViewModel> {
        return this.http.get<DashboardProductListKPIViewModel>(this.staffDashboardBase + '/order/list/product/thismonth');
    }


    // VENDOR
    // get vendor list for today
    getTodayVendorList(): Observable<DashboardVendorListKPIViewModel> {
        return this.http.get<DashboardVendorListKPIViewModel>(this.staffDashboardBase + '/order/list/vendor/today');
    }

    // get vendor list for this week
    getThisWeekVendorList(): Observable<DashboardVendorListKPIViewModel> {
        return this.http.get<DashboardVendorListKPIViewModel>(this.staffDashboardBase + '/order/list/vendor/thisweek');
    }

    // get vendor list for this month
    getThisMonthVendorList(): Observable<DashboardVendorListKPIViewModel> {
        return this.http.get<DashboardVendorListKPIViewModel>(this.staffDashboardBase + '/order/list/vendor/thismonth');
    }


    // CITY
    // get city list for today
    getTodayCityList(): Observable<DashboardCityListKPIViewModel> {
        return this.http.get<DashboardCityListKPIViewModel>(this.staffDashboardBase + '/order/list/city/today');
    }

    // get city list for this week
    getThisWeekCityList(): Observable<DashboardCityListKPIViewModel> {
        return this.http.get<DashboardCityListKPIViewModel>(this.staffDashboardBase + '/order/list/city/thisweek');
    }

    // get city list for this month
    getThisMonthCityList(): Observable<DashboardCityListKPIViewModel> {
        return this.http.get<DashboardCityListKPIViewModel>(this.staffDashboardBase + '/order/list/city/thismonth');
    }


    // RIDER
    // get rider list for today
    getTodayRiderList(): Observable<DashboardRiderListKPIViewModel> {
        return this.http.get<DashboardRiderListKPIViewModel>(this.staffDashboardBase + '/order/list/rider/today');
    }

    // get rider list for this week
    getThisWeekRiderList(): Observable<DashboardRiderListKPIViewModel> {
        return this.http.get<DashboardRiderListKPIViewModel>(this.staffDashboardBase + '/order/list/rider/thisweek');
    }

    // get rider list for this month
    getThisMonthRiderList(): Observable<DashboardRiderListKPIViewModel> {
        return this.http.get<DashboardRiderListKPIViewModel>(this.staffDashboardBase + '/order/list/rider/thismonth');
    }
}
