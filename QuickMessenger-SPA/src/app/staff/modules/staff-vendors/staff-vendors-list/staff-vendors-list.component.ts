import { StaffVendorsService } from './../staff-vendors.service';
import { StaffLayoutComponent } from './../../staff-shared/components/staff-layout/staff-layout.component';
import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { VendorViewModel } from 'src/app/models/vendor';
import { NotificationService } from 'src/app/services/notification.service';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-staff-vendors-list',
    templateUrl: './staff-vendors-list.component.html',
    styleUrls: ['./staff-vendors-list.component.css']
})
export class StaffVendorsListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Vendors: VendorViewModel[] = [];

    modalRef: NgbModalRef;

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffVendorService: StaffVendorsService,
                private notify: NotificationService,
                private modalService: NgbModal) {
            // set page title
            this.titleService.setTitle('Vendors | Quick Waka');

            // set page heading
            parentComponent.PageHeading = 'Vendors';
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
        this.loadVendors();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffVendorService.getVendorList(1, this.pagination.itemsPerPage, term))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Vendors = response.result;

            this.contentLoading = false;
        });
    }

    // Content Loading Operations
    loadVendors(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffVendorService.getVendorList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Vendors = response.result;
                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading vendor list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadVendors(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadVendors();
        window.scrollTo(0, 0);
    }

    getFirstLetter(name: string) {
        return name.charAt(0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }
}
