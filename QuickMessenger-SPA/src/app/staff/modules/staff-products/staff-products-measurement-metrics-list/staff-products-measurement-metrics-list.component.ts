import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MeasurementMetricViewModel } from 'src/app/models/measurement-metric';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { StaffProductsService } from '../staff-products.service';
import { NotificationService } from 'src/app/services/notification.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-staff-products-measurement-metrics-list',
    templateUrl: './staff-products-measurement-metrics-list.component.html',
    styleUrls: ['./staff-products-measurement-metrics-list.component.css']
})
export class StaffProductsMeasurementMetricsListComponent implements OnInit {
    contentLoading = false;
    pagination: Pagination;

    MeasurementMetrics: MeasurementMetricViewModel[] = [];

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    modalRef: NgbModalRef;

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffProductsService: StaffProductsService,
                private notify: NotificationService) {
        // set page title
        this.titleService.setTitle('Measurement Metrics | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Measurement Metrics';
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
        this.loadMeasurementMetrics();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffProductsService.getMeasurementMetricsList(1, this.pagination.itemsPerPage, term))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.MeasurementMetrics = response.result;

            this.contentLoading = false;
        });
    }


    // Content Loading Operations
    loadMeasurementMetrics(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffProductsService.getMeasurementMetricsList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.MeasurementMetrics = response.result;

                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading measurement metrics, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        // this.clearFilter();
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadMeasurementMetrics(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadMeasurementMetrics();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }

}
