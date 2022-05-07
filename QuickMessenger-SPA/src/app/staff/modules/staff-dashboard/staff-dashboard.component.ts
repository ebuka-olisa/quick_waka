import { OrderStatsKPIViewModel, OrderChartTodayKPIViewModel, DashboardCityListKPIViewModel, DashboardProductListKPIViewModel,
    DashboardVendorListKPIViewModel, DashboardRiderListKPIViewModel } from './../../../models/staff-dashboard';
import { StaffLayoutComponent } from './../staff-shared/components/staff-layout/staff-layout.component';
import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { StaffDashboardService } from './staff-dashboard.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SharedService } from 'src/app/services/shared.service';

enum ReportViewState {
    Today = 0, Week = 1, Month = 2
}

@Component({
    selector: 'app-staff-dashboard',
    templateUrl: './staff-dashboard.component.html',
    styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {

    Counts: OrderStatsKPIViewModel = new OrderStatsKPIViewModel();
    TodayChart: OrderChartTodayKPIViewModel[] = [];
    ThisWeekChart: OrderChartTodayKPIViewModel[] = [];
    ThisMonthChart: OrderChartTodayKPIViewModel[] = [];
    ProductList: DashboardProductListKPIViewModel[] = [];
    VendorList: DashboardVendorListKPIViewModel[] = [];
    CityList: DashboardCityListKPIViewModel[] = [];
    RiderList: DashboardRiderListKPIViewModel[] = [];

    loadingCards: boolean;
    loadingCharts: boolean;
    loadingProductList: boolean;
    loadingVendorList: boolean;
    loadingCityList: boolean;
    loadingRiderList: boolean;

    currentView: ReportViewState = ReportViewState.Today;
    currentViewDate: string;
    currentViewTemp = 0;

    dataSource;

    ShowDays = false;
    ShowMinutes = false;
    ShowHours = false;

    ResponseTime = {
        Days : 0,
        Minutes: 0,
        Hours: 0
    };

    constructor(private title: Title,
                private staffDashboardService: StaffDashboardService,
                private sharedService: SharedService,
                private notify: NotificationService,
                parentComponent: StaffLayoutComponent) {

        // set page title
        this.title.setTitle('Dashboard | Quick Waka');


        // set page heading
        parentComponent.PageHeading = 'Dashboard';
    }

    ngOnInit() {
        // current view date
        const todayDate = new Date();
        this.currentViewDate = this.sharedService.DaysOfWeek[todayDate.getDay()] + ', ' + todayDate.getDate() + ' '
                        + this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();

        // load cards
        this.loadOrderCardDetails();


        // load charts
        this.dataSource = this.getChartBasics();
        this.dataSource.chart.theme = 'fusion';
        // this.dataSource.chart.numberSuffix = 'K';
        this.loadOrderChartDetails();


        // load lists
        this.loadProductListDetails();
        this.loadVendorListDetails();
        this.loadCityListDetails();
        this.loadRiderListDetails();
    }

    reloadDashboard(value) {
        const todayDate = new Date();

        if (value === 0 || value === '0') {
            this.currentView = ReportViewState.Today;

            // current view date
            this.currentViewDate = this.sharedService.DaysOfWeek[todayDate.getDay()] + ', ' + todayDate.getDate() + ' '
                            + this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();
        } else if (value === 1 || value === '1') {
            this.currentView = ReportViewState.Week;

            // current view date
            const Sunday = this.getSunday(todayDate);
            if (Sunday.getDate() < todayDate.getDate()) {
                this.currentViewDate = this.sharedService.DaysOfWeek[Sunday.getDay()] + ' ' + Sunday.getDate() + ' - '
                    + this.sharedService.DaysOfWeek[todayDate.getDay()] + ' ' + todayDate.getDate() + ', '
                    + this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();
            } else if (Sunday.getDate() === todayDate.getDate()) {
                this.currentViewDate = this.sharedService.DaysOfWeek[todayDate.getDay()] + ', ' + todayDate.getDate() + ' '
                    + this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();
            } else {
                this.currentViewDate = this.sharedService.DaysOfWeek[Sunday.getDay()] + ', ' + Sunday.getDate() + ' '
                    + this.sharedService.Months[Sunday.getMonth()] + ', ' + Sunday.getFullYear() + ' - '
                    + this.sharedService.DaysOfWeek[todayDate.getDay()] + ', ' + todayDate.getDate() + ' '
                    + this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();
            }
        } else if (value === 2 || value === '2') {
            this.currentView = ReportViewState.Month;

            // current view date
            this.currentViewDate = this.sharedService.Months[todayDate.getMonth()] + ', ' + todayDate.getFullYear();
        }

        // load cards
        this.loadOrderCardDetails();

        // load charts
        this.loadOrderChartDetails();


        // load lists
        this.loadProductListDetails();
        this.loadVendorListDetails();
        this.loadCityListDetails();
        this.loadRiderListDetails();
    }

    getSunday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day; // + (day === 0 ? -6 : 0); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    getChartBasics() {
        const chartBasics = {
            chart: {
                showvalues: '0',
                formatnumberscale: '0'

                /*bgColor: '#ffffff',
                showBorder: '0',*
                paletteColors: '#db720a',

                // baseFont: '"sans-serif"',
                baseFontColor: '#333',
                baseFontSize: '11',
                outcnvbasefontcolor: '#333',

                canvasBgColor: '#ffffff',
                showCanvasBorder: '0',
                useplotgradientcolor: '0',
                useRoundEdges: '0',
                showPlotBorder: '0',
                showAlternateHGridColor: '0',
                showAlternateVGridColor: '0',

                toolTipColor: '#ffffff',
                toolTipBorderThickness: '0',
                toolTipBgColor: '#000000',
                toolTipBgAlpha: '80',
                toolTipBorderRadius: '2',
                toolTipPadding: '5',

                legendBgAlpha: '0',
                legendBorderAlpha: '0',
                legendShadow: '0',
                legendItemFontSize: '10',
                legendItemFontColor: '#666666',
                legendCaptionFontSize: '9',

                divlineAlpha: '100',
                divlineColor: '#999999',
                divlineThickness: '1',
                divlineIsDashed: '1',
                divlineDashLen: '1',
                divlineGapLen: '1',

                scrollheight: '10',
                flatScrollBars: '1',
                scrollShowButtons: '0',
                scrollColor: '#cccccc',
                showHoverEffect: '1',

                showXAxisLine: '1',
                xAxisLineThickness: '1',
                xAxisLineColor: '#999999999',

                valueFontColor: '#ffffff',
                placeValuesInside: '0'*/
            },
            data: []
        };

        return chartBasics;
    }

    // helpers
    processTime(time) {
        time = Math.floor(time);
        this.ShowDays = false;
        this.ShowMinutes = false;
        this.ShowHours = false;
        if (time === 1) {
            this.ShowMinutes = true;
            this.ResponseTime.Minutes = time;
        } else if (time < 60) {
            this.ShowMinutes = true;
            this.ResponseTime.Minutes = time;
        } else {
            let hr = Math.floor(time / 60);
            const min = time % 60;
            if (hr > 23) {
                const days = Math.floor(hr / 24);
                hr = hr % 24;
                if (hr > 0) {
                    this.ShowHours = true;
                }
                this.ShowDays = true;
                this.ResponseTime.Days = days;
                this.ResponseTime.Hours = hr;
            } else {
                if (min > 0) {
                    this.ShowMinutes = true;
                }
                this.ShowHours = true;
                this.ResponseTime.Minutes = min;
                this.ResponseTime.Hours = hr;
            }
        }
    }



    // cards
    loadOrderCardDetails() {
        this.loadingCards = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayOrderStats();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekOrderStats();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthOrderStats();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.Counts = response;

                    // process response time
                    this.processTime(this.Counts.averageOrderResponseTime);

                    this.loadingCards = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading order information, please reload page.');
                    this.Counts = new OrderStatsKPIViewModel();
                    this.loadingCards = true;
                }
            );
        }
    }



    // chart
    loadOrderChartDetails() {
        this.loadingCharts = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayOrderCharts();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekOrderCharts();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthOrderCharts();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.loadingCharts = false;

                    // process chart
                    this.dataSource.chart.caption = 'Total Orders';
                    this.dataSource.chart.subCaption = this.currentViewDate;

                    if (this.currentView === ReportViewState.Today) {
                        this.TodayChart = response;
                        // this.dataSource.chart.xAxisName = 'Hour of Day';
                        this.processTodayChart();
                    } else if (this.currentView === ReportViewState.Week) {
                        this.ThisWeekChart = response;
                        // this.dataSource.chart.xAxisName = 'Day of Week';
                        this.processThisWeekChart();
                    } else {
                        this.ThisMonthChart = response;
                        // this.dataSource.chart.xAxisName = 'Day of Month';
                        this.processThisMonthChart();
                    }
                },

                // error
                () => {
                    this.notify.error('Problem loading order information, please reload page.');
                    this.TodayChart = [];
                    this.ThisWeekChart = [];
                    this.ThisMonthChart = [];
                    this.loadingCharts = true;
                }
            );
        }
    }

    processTodayChart() {
        this.dataSource.data = [];
        for (let i = 0; i <= 23; i++) {
            let label;
            switch (i) {
                case 0:
                    label = 'midnight';
                    break;
                case 12:
                    label = 'noon';
                    break;
                default:
                    label = (i % 12) + (i < 12 ? ' am' : ' pm');
                    break;
            }
            this.dataSource.data.push({
                label,
                value: 0
            });
        }
        for (const item of this.TodayChart) {
            this.dataSource.data[item.hour].value = item.total;
        }
    }

    processThisWeekChart() {
        this.dataSource.data = [];
        for (const item of this.ThisWeekChart) {
            this.dataSource.data.push({
                label : item.dayOfTheWeek,
                value: item.total
            });
        }
    }

    processThisMonthChart() {
        this.dataSource.data = [];
        for (let index = 0; index < this.ThisMonthChart.length; index++) {
            this.dataSource.data.push({
                label : this.ordinalSuffix(index + 1),
                value: this.ThisMonthChart[index].total
            });
        }
    }

    ordinalSuffix(i) {
        const j = i % 10;
        const k = i % 100;
        if (j === 1 && k !== 11) {
            return i + 'st';
        }
        if (j === 2 && k !== 12) {
            return i + 'nd';
        }
        if (j === 3 && k !== 13) {
            return i + 'rd';
        }
        return i + 'th';
    }



    // list
    loadProductListDetails() {
        this.loadingProductList = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayProductList();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekProductList();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthProductList();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.ProductList = response;
                    this.loadingProductList = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading product information, please reload page.');
                    this.ProductList = [];
                    this.loadingProductList = false;
                }
            );
        }
    }

    loadVendorListDetails() {
        this.loadingVendorList = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayVendorList();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekVendorList();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthVendorList();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.VendorList = response;
                    this.loadingVendorList = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading vendor information, please reload page.');
                    this.VendorList = [];
                    this.loadingVendorList = false;
                }
            );
        }
    }

    loadCityListDetails() {
        this.loadingCityList = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayCityList();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekCityList();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthCityList();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.CityList = response;
                    this.loadingCityList = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading city information, please reload page.');
                    this.CityList = [];
                    this.loadingCityList = false;
                }
            );
        }
    }

    loadRiderListDetails() {
        this.loadingRiderList = true;
        let result = null;

        if (this.currentView === ReportViewState.Today) {
            result = this.staffDashboardService.getTodayRiderList();
        } else if (this.currentView === ReportViewState.Week) {
            result = this.staffDashboardService.getThisWeekRiderList();
        } else if (this.currentView === ReportViewState.Month) {
            result = this.staffDashboardService.getThisMonthRiderList();
        }

        // process
        if (result != null) {
            result.subscribe(
                // success
                (response) => {
                    this.RiderList = response;
                    this.loadingRiderList = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading rider information, please reload page.');
                    this.RiderList = [];
                    this.loadingRiderList = false;
                }
            );
        }
    }

}
