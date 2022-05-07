export class OrderStatsKPIViewModel {
    total: number;
    delivered: number;
    pending: number;
    onTheWay: number;
    value: number;
    dayOfTheWeek: string;
    averageOrderPerRider: number;
    averageOrderResponseTime: number;
}

export class OrderChartTodayKPIViewModel extends OrderStatsKPIViewModel {
    hour: number;
}

export class DashboardCityListKPIViewModel {
    country: string;
    state: string;
    city: string;
    orders: number;
}

export class DashboardProductListKPIViewModel {
    name: string;
    id: number;
    category: string;
    orders: number;
    photoUrl: string;
}

export class DashboardVendorListKPIViewModel {
    name: string;
    id: number;
    city: string;
    orders: number;
    photoUrl: string;
}

export class DashboardRiderListKPIViewModel {
    firstName: string;
    lastName: string;
    id: number;
    orders: number;
    photoUrl: string;
}
