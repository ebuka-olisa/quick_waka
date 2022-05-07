import { NotificationService } from 'src/app/services/notification.service';
import { StaffProductsService } from './../staff-products.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { Pagination } from 'src/app/models/pagination';
import { Subject } from 'rxjs';
import { CategoryDetailsViewModel } from 'src/app/models/category';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StaffProductsCategoryAddComponent } from '../staff-products-category-add/staff-products-category-add.component';

@Component({
    selector: 'app-staff-products-categories-list',
    templateUrl: './staff-products-categories-list.component.html',
    styleUrls: ['./staff-products-categories-list.component.css']
})
export class StaffProductsCategoriesListComponent implements OnInit {
    contentLoading = false;
    pagination: Pagination;

    Categories: CategoryDetailsViewModel[] = [];
    DisplayedCategories: CategoryDetailsViewModel[] = [];

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    modalRef: NgbModalRef;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
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
        this.titleService.setTitle('Categories | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Categories';
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
        // this.createDummyData();
        this.loadCategories();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffProductsService.getCategoriesList(1, this.pagination.itemsPerPage, term))
        )
        .subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Categories = response.result;

            this.contentLoading = false;
        });
    }

    createDummyData() {
        this.Categories = [
            {
                id: 1,
                name : 'Beverages',
                description : 'This is the description for beverage',
                parent: {id: 5, name: 'Grocery'},
            },
            {
                id: 2,
                name : 'Energy Drinks',
                description : 'This is the description for energy drinks',
                parent: {id: 5, name: 'Grocery', parent: {id: 1, name: 'Beverages'}}
            },
            {
                id: 3,
                name : 'Hair Care',
                description : 'This is the description for beverage',
                parent: {id: 4, name: 'Health & Beauty'}
            },
            {
                id: 4,
                name : 'Health & Beauty',
                description : 'This is the description for health and beauty'
            },
            {
                id: 5,
                name : 'Grocery',
                description : 'This is the description for grocery'
            },
            {
                id: 6,
                name : 'Electronics',
                description : 'This is the description for electronics'
            },
            {
                id: 7,
                name : 'Computers',
                description : 'This is the description for computers',
                parent: {id: 6, name: 'Electronics'},
                properties: [
                    { prod_CategoryId: 7, prod_PropertyTypeId: 1, propertyTypeName: 'Size',
                    prod_MeasurementTypeId: 2, measurementTypeSymbol: 'MB', canDelete: true},
                    { prod_CategoryId: 7, prod_PropertyTypeId: 1, propertyTypeName: 'Size',
                    prod_MeasurementTypeId: 5, measurementTypeSymbol: 'GB', canDelete: false},
                    { prod_CategoryId: 7, prod_PropertyTypeId: 5, propertyTypeName: 'Gender', canDelete: true}
                ]
            },
        ];
        this.pagination.totalCount = this.Categories.length;
        this.DisplayedCategories = this.Categories.slice(0, this.pagination.itemsPerPage);
    }


    // Content Loading Operations
    loadCategories(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffProductsService.getCategoriesList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Categories = response.result;

                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading category list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadCategories(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadCategories();
        window.scrollTo(0, 0);
    }


    // Parent Operations
    showParents(Category: CategoryDetailsViewModel) {
        let parents = '';
        while (Category.parent) {
            parents = `${Category.parent.name} / ${parents}` ;
            Category = Category.parent;
        }
        return parents;
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }
}
