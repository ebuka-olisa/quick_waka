import { StaffOrdersEditComponent } from './../staff-orders-edit/staff-orders-edit.component';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StaffOrdersService } from '../staff-orders.service';
import { OrderListViewModel } from 'src/app/models/order';
import { NotificationService } from 'src/app/services/notification.service';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-staff-orders-list',
    templateUrl: './staff-orders-list.component.html',
    styleUrls: ['./staff-orders-list.component.css']
})
export class StaffOrdersListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Orders: OrderListViewModel[] = [];

    Filter: {type: string, state: string[]} = { type : null, state: []};
    SelectedFilter: {type: string, state: string[]} = { type : null, state: []};
    filtered: boolean;
    FilteredElements: any[] = [];

    modalRef: NgbModalRef;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffOrdersService: StaffOrdersService,
                private notify: NotificationService,
                private modalService: NgbModal) {

        // set page title
        this.titleService.setTitle('Orders | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Orders';
        parentComponent.PageSubHeading = '';

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit() {
        this.loadOrders();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffOrdersService.getOrdersList(1, this.pagination.itemsPerPage, term, 
                this.Filter.type, this.Filter.state))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Orders = response.result;

            this.contentLoading = false;
        });
    }

    // Content Loading Operations
    loadOrders(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffOrdersService.getOrdersList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm,
            this.Filter.type, this.Filter.state)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Orders = response.result;

                this.SelectedFilter.type = this.Filter.type;
                this.SelectedFilter.state = [];
                this.Filter.state.forEach((value: string) => {
                    this.SelectedFilter.state.push(value);
                });

                // show filters
                this.filtered = false;
                this.FilteredElements = [];
                for (const key in this.Filter) {
                    if (this.Filter.hasOwnProperty(key)) {
                        const value = this.Filter[key];
                        if (value !== null) {
                            if (Array.isArray(value)) {
                                if (value.length > 0) {
                                    this.filtered = true;
                                    for (const index in value) {
                                        if (value.hasOwnProperty(index)) {
                                            this.FilteredElements.push(
                                                {key, value: value[index] === 'On The Way' ? 'Enroute' : value[index], index });
                                        }
                                    }
                                }
                            } else {
                                this.filtered = true;
                                this.FilteredElements.push({key, value});
                            }
                        }
                    }
                }

                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading order list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.clearFilter();
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadOrders(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadOrders();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }


    // Filter Opeations
    clearFilter() {
        this.Filter.type = null;
        this.Filter.state = [];
        if (this.filtered) {
            this.loadOrders(1);
        }
    }

    handleFilterOpen() {
        // return to previous settings
        this.Filter.type = this.SelectedFilter.type;
        this.Filter.state = [];
        this.SelectedFilter.state.forEach((value: string) => {
            this.Filter.state.push(value);
        });
    }

    removeFilter(key: string, index?: number) {
        if (!index) {
            this.Filter[key] = null;
        } else if (Array.isArray(this.Filter[key])) {
            this.Filter[key].splice(index, 1);
        }
        this.loadOrders(1);
    }

    toggleFilterState(state: string) {
        const index = this.Filter.state.indexOf(state);
        if (index === -1) {
            this.Filter.state.push(state);
        } else {
            this.Filter.state.splice(index, 1);
        }
    }

    filter() {
        this.loadOrders(1);
    }

}
