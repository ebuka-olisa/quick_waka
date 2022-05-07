import { StaffProductsService } from './../staff-products.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { ExtraAttributeDetailsViewModel } from 'src/app/models/extra-attributes';
import { NotificationService } from 'src/app/services/notification.service';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StaffProductsExtraAttributesAddComponent } from '../staff-products-extra-attributes-add/staff-products-extra-attributes-add.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-staff-products-extra-attributes-list',
    templateUrl: './staff-products-extra-attributes-list.component.html',
    styleUrls: ['./staff-products-extra-attributes-list.component.css']
})
export class StaffProductsExtraAttributesListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    ExtraAttributes: ExtraAttributeDetailsViewModel[] = [];

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    modalRef: NgbModalRef;
    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffProductsService: StaffProductsService,
                private notify: NotificationService,
                private modalService: NgbModal) {
        // set page title
        this.titleService.setTitle('Extra Attributes | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Extra Attributes';
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
        this.loadExtraAttributes();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffProductsService.getExtraAttributesList(1, this.pagination.itemsPerPage, term))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.ExtraAttributes = response.result;

            this.contentLoading = false;
        });
    }


    // Content Loading Operations
    loadExtraAttributes(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;

        // ensure this uses search and filter
        this.staffProductsService.getExtraAttributesList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.ExtraAttributes = response.result;

                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading extra attributes list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        // this.clearFilter();
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadExtraAttributes(1);
    }

    pageChanged(newPageNumber: number): void {
        /*const startItem = (newPageNumber - 1) * this.pagination.itemsPerPage;
        const endItem = newPageNumber * this.pagination.itemsPerPage;
        this.DisplayedExtraAttributes = this.ExtraAttributes.slice(startItem, endItem);*/

        this.pagination.currentPage = newPageNumber;
        this.loadExtraAttributes();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }

}
