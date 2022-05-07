import { StaffProductsService } from './../staff-products.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { Subject } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import { ProductViewModel } from 'src/app/models/product';
import { NgbModalRef, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { CategoryDetailsViewModel } from 'src/app/models/category';

@Component({
    selector: 'app-staff-products-list',
    templateUrl: './staff-products-list.component.html',
    styleUrls: ['./staff-products-list.component.css']
})
export class StaffProductsListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Products: ProductViewModel[] = [];
    ProductStatus: string;

    Filter: {deactivated: string} = { deactivated : 'false'};
    filtered: boolean;
    FilteredElements: any[] = [];

    modalRef: NgbModalRef;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffProductService: StaffProductsService,
                private notify: NotificationService,
                private modalService: NgbModal) {

        // set page title
        titleService.setTitle('Products | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Products';
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
        this.loadProducts();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffProductService.getProductsList(1, this.pagination.itemsPerPage,
                term, this.Filter.deactivated))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Products = response.result;

            this.contentLoading = false;
        });
    }

    createDummyData() {
        /*this.Products = [
        {
            id: 1,
            name : 'Apple Hair Cream',
            price : 800,
            prod_Category : {id: 1, name: 'Beauty And Health'},
            vendor : {id: 1, name: 'Accufarm', email: '', phone: '', address: null},
            photos: null,
            productProperties: null
        },
        {
            id: 2,
            name : 'Nivea Lotion',
            price : 2300,
            prod_Category : {id: 1, name: 'Beauty And Health'},
            vendor : {id: 2, name: 'Gynko', email: '', phone: '', address: null},
            photos: null,
            productProperties: null
        },
        {
            id: 3,
            name : 'Toyota Corolla 2013',
            price : 1300000,
            prod_Category : {id: 2, name: 'Automobiles And Motorcycles'},
            vendor : {id: 3, name: 'Wazzu', email: '', phone: '', address: null},
            photos: null,
            productProperties: null
        },
        {
            id: 1,
            name : 'Samsung QLED Soundbar',
            price : 60300,
            prod_Category : {id: 3, name: 'Home Audio And Video', parent: {id: 4, name: 'Consumer Electronics'}},
            vendor : {id: 1, name: 'Primordia', email: '', phone: '', address: null},
            photos: null,
            productProperties: null
        },
        {
            id: 1,
            name : 'Samung 40\' LED TV',
            price : 120500,
            prod_Category : {id: 5, name: 'Televisions',
                parent: {id: 3, name: 'Home Audio And Video', parent: {id: 4, name: 'Consumer Electronics'}}},
            vendor : {id: 1, name: 'Primordia', email: '', phone: '', address: null},
            photos: null,
            productProperties: null
        }
        ];
        this.pagination.totalCount = this.Products.length;*/
        // this.DisplayedProducts = this.Products.slice(0, this.pagination.itemsPerPage);
    }


    // Content Loading/List Operations
    loadProducts(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffProductService.getProductsList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm, this.Filter.deactivated)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Products = response.result;
                this.ProductStatus = this.Filter.deactivated === 'false' ? 'Active' : 'Inactive';

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

                // loading has completed successfully
                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading product list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadProducts(1);
    }

    pageChanged(newPageNumber: number): void {
        /*const startItem = (newPageNumber - 1) * this.pagination.itemsPerPage;
        const endItem = newPageNumber * this.pagination.itemsPerPage;
        this.DisplayedProducts = this.Products.slice(startItem, endItem);*/

        this.pagination.currentPage = newPageNumber;
        this.loadProducts();
        window.scrollTo(0, 0);
    }

    showParents(Category: CategoryDetailsViewModel) {
        let parents = '';
        if (Category.parent) {
            while (Category.parent) {
                parents = `${Category.parent.name} / ${parents}` ;
                Category = Category.parent;
            }
        }
        return parents;
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        // this.clearFilterForReload();
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }


    // Filter Opeations
    clearFilter() {
        this.Filter.deactivated = 'false';
        if (this.filtered) {
            this.loadProducts(1);
        }
    }

    handleFilterOpen() {
        // return to previous settings
        this.Filter.deactivated = this.ProductStatus === 'Active' ? 'false' : 'true';
    }

    removeFilter(key: string, index?: number) {
        if (index === null) {
            this.Filter[key] = null;
        } else if (Array.isArray(this.Filter[key])) {
            this.Filter[key].splice(index, 1);
        }
        this.loadProducts(1);
    }

    filter() {
        this.loadProducts(1);
    }
}
