import { StaffServicesService } from './../staff-services.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceListViewModel } from 'src/app/models/service';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { NotificationService } from 'src/app/services/notification.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-staff-services-list',
  templateUrl: './staff-services-list.component.html',
  styleUrls: ['./staff-services-list.component.css']
})
export class StaffServicesListComponent implements OnInit {

        contentLoading = false;
        pagination: Pagination;

        @ViewChild('searchText', {static: false}) searchText: ElementRef;
        lastSearchTerm: string = null;
        private searchTerms = new Subject<string>();

        Services: ServiceListViewModel[] = [];

        modalRef: NgbModalRef;

        constructor(private titleService: Title,
                    parentComponent: StaffLayoutComponent,
                    private staffServicesService: StaffServicesService,
                    private notify: NotificationService) {
        // set page title
        this.titleService.setTitle('Services | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Services';
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
        this.loadServices();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffServicesService.getServicesList(1, this.pagination.itemsPerPage, term))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Services = response.result;

            this.contentLoading = false;
        });
    }

    // Content Loading Operations
    loadServices(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffServicesService.getServicesList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Services = response.result;
                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading service list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadServices(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadServices();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }

}
