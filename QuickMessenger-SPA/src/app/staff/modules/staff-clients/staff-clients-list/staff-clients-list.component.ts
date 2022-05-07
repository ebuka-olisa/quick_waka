import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { ClientViewModel } from 'src/app/models/client';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/services/notification.service';
import { StaffClientsService } from '../staff-clients.service';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';

@Component({
    selector: 'app-staff-clients-list',
    templateUrl: './staff-clients-list.component.html',
    styleUrls: ['./staff-clients-list.component.css']
})
export class StaffClientsListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Clients: ClientViewModel[] = [];
    ClientStatus: string;

    Filter: {deactivated: string} = { deactivated : 'false'};
    filtered: boolean;
    FilteredElements: any[] = [];

    modalRef: NgbModalRef;

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffClientService: StaffClientsService,
                private notify: NotificationService) {

        // set page title
        this.titleService.setTitle('Clients | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Clients';
        parentComponent.PageSubHeading = '';

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit() {
        // this.createDummyData();
        this.loadClients();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffClientService.getClientList(1, this.pagination.itemsPerPage, term,
                this.Filter.deactivated))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Clients = response.result;

            this.contentLoading = false;
        });
    }


    // Content Loading/List Operations
    loadClients(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffClientService.getClientList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm, this.Filter.deactivated)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Clients = response.result;
                this.ClientStatus = this.Filter.deactivated === 'false' ? 'Active' : 'Inactive';

                // show filters
                this.filtered = false;
                this.FilteredElements = [];
                for (const key in this.Filter) {
                    if (this.Filter.hasOwnProperty(key)) {
                        const value = this.Filter[key];
                        if (value !== null) {
                            this.filtered = true;
                            this.FilteredElements.push({key: key === 'deactivated' ? 'Status' : key,
                                 value: (key === 'deactivated' ? (value === 'true' ? 'Inactive' : 'Active') : value)});
                        }
                    }
                }
                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading client list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadClients(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadClients();
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
        this.Filter.deactivated = 'false';
        if (this.filtered) {
            this.loadClients(1);
        }
    }

    handleFilterOpen() {
        // return to previous settings
        this.Filter.deactivated = this.ClientStatus === 'Active' ? 'false' : 'true';
    }

    removeFilter(key: string, index?: number) {
        if (index === null) {
            this.Filter[key] = null;
        } else if (Array.isArray(this.Filter[key])) {
            this.Filter[key].splice(index, 1);
        }
        this.loadClients(1);
    }

    filter() {
        this.loadClients(1);
    }

}
