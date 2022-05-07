import { ServiceViewModel } from './../../../models/service';
import { VisitorCartService } from './../../services/visitor-cart.service';
import { VisitorProductService } from './../../services/visitor-product.service';
import { VendorLiteViewModel } from 'src/app/models/vendor';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Pagination } from 'src/app/models/pagination';
import { ProductListViewModel } from 'src/app/models/product';
import { CategoryLiteViewModel, CategoryWithParentLiteViewModel } from 'src/app/models/category';
import { Options, ChangeContext } from 'ng5-slider';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitorVendorService } from '../../services/visitor-vendor.service';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitorProductItemComponent } from '../visitor-product-item/visitor-product-item.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { VisitorProductAddedComponent } from '../visitor-product-added/visitor-product-added.component';

@Component({
    selector: 'app-visitor-vendor-details',
    templateUrl: './visitor-vendor-details.component.html',
    styleUrls: ['./visitor-vendor-details.component.css']
})
export class VisitorVendorDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Vendor: VendorLiteViewModel;
    Products: ProductListViewModel[];
    Categories: CategoryLiteViewModel[] = [];
    TopLevelCategories: CategoryLiteViewModel[] = [];
    Category: CategoryWithParentLiteViewModel;
    ParentCategories: CategoryLiteViewModel[];
    NewEntryCount = -1;

    Search = {
        searchTerm: '',
        section: 'vendors'
    };

    DefaultGenericService: ServiceViewModel;

    pagination: Pagination;

    Filter = {
        searchTerm: '',
        sort : '',
        category: '',
        minPrice: '',
        maxPrice: ''
    };
    filterActive = false;
    reloadingItems = false;
    backgroundLoadingItems = false;
    topLevel = false;

    defaultMinPrice = 0;
    defaultMaxPrice = 1000;
    minValue = 0;
    maxValue = 1000;
    options: Options = {
        floor: 200,
        ceil: 1000
        /*translate: (value: number): string => {
            return '₦' + value;
        }*/
    };

    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: true,
        backdrop: true, // 'static'
        windowClass: 'full-modal'
    };
    private successModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: true
    };

    constructor(private title: Title,
                private vendorService: VisitorVendorService,
                private productService: VisitorProductService,
                private modalService: NgbModal,
                private notify: NotificationService,
                private actRoute: ActivatedRoute,
                private router: Router,
                private renderer: Renderer2,
                private cartService: VisitorCartService,
                private changeDetector: ChangeDetectorRef) {

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 4, // 48
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };

        this.Vendor = new VendorLiteViewModel();
    }

    ngOnInit() {
        this.actRoute.data.subscribe(data => {

            this.Vendor = data.items.vendorInfo;
            this.DefaultGenericService = data.items.defaultGeneric;
            this.title.setTitle(`${this.Vendor.name} | Quick Waka`);

            this.topLevel = true;
            this.TopLevelCategories = data.items.topCategories ? data.items.topCategories.categories : [];

            this.defaultMinPrice = data.items.productInfo.result.minPrice;
            this.defaultMaxPrice = data.items.productInfo.result.maxPrice;
            this.minValue = data.items.productInfo.result.minPrice;
            this.maxValue = data.items.productInfo.result.maxPrice;
            this.options.floor = data.items.productInfo.result.minPrice;
            this.options.ceil = data.items.productInfo.result.maxPrice;

            // process filters
            this.Filter = {searchTerm: '', sort : '', category: '', minPrice: '', maxPrice: ''};
            this.actRoute.queryParams.subscribe(params => {
                for (const key in params) {
                    if (params.hasOwnProperty(key)) {
                        this.filterActive = true;
                        this.Filter[key] = params[key];
                        if (key === 'minPrice') {
                            this.minValue = params[key];
                        }
                        if (key === 'maxPrice') {
                            this.maxValue = params[key];
                        }
                        if (key === 'category') {
                            this.topLevel = false;
                        }
                    }
                }
            });

            // process info from server
            this.processPageInfo(data.items.productInfo);
        });

        this.setupSearch();
    }

    ngAfterViewInit() {
        this.renderer.setProperty(this.searchText.nativeElement, 'value', this.Filter.searchTerm);
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    processPageInfo(data) {
        this.pagination.currentPage = data.pagination.currentPage;
        this.pagination.totalCount = data.pagination.totalCount;

        this.Products = data.result.products;

        this.Categories = this.topLevel ? this.TopLevelCategories : data.result.childrenCategories;
        this.Category = !this.topLevel ? data.result.category : null;
        /*this.ParentCategories = [];
        if (this.Category) {
            let currentCat = this.Category;
            while (currentCat.parent) {
                this.ParentCategories.push({id: currentCat.parent.id, nameId: '', name: currentCat.parent.name});
                currentCat = currentCat.parent;
            }
            this.ParentCategories = this.ParentCategories.reverse();
        }*/
    }


    // FILTER
    filter(option, value, dropdown) {
        value += '';
        // if filter has changed, then reload page
        if (this.Filter[option] !== value) {
            this.Filter[option] = value;
            this.startFilter(dropdown);
        }
    }

    goToParentCategory(dropdown) {
        // if filter has changed, then reload page
        if (this.Category.parent) {
            this.Filter.category = this.Category.parent.id + '';
        } else {
            this.Filter.category = '';
        }
        this.startFilter(dropdown);
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => {
                this.Filter.searchTerm = term;
                const queryParams = this.generateQueryParams();
                if (queryParams.hasOwnProperty('category')) {
                    this.topLevel = false;
                } else {
                    this.topLevel = true;
                }

                // change url
                const queryIndex = this.router.url.indexOf('?');
                const url = queryIndex === -1 ? this.router.url : this.router.url.substring(0, queryIndex);
                this.router.navigate([url], { queryParams , replaceUrl: true});

                // search
                return this.vendorService.getProducts(this.Vendor.id, queryParams, 1, this.pagination.itemsPerPage);
            })
        ).subscribe(response => {
            this.processPageInfo(response);
            if (this.Filter.minPrice !== '') {
                this.minValue = Number.parseInt(this.Filter.minPrice, 10);
            }
            if (this.Filter.maxPrice !== '') {
                this.maxValue = Number.parseInt(this.Filter.maxPrice, 10);
            }
            this.reloadingItems = false;
            // this.pagination.currentPage = response.pagination.currentPage;
            // this.pagination.totalCount = response.pagination.totalCount;

            // this.Services = response.result;

            // this.contentLoading = false;
        });
    }

    search(term: string): void {
        this.reloadingItems = true;
        // this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }

    priceChange(changeContext: ChangeContext): void {
        const minPrice = changeContext.value;
        const maxPrice = changeContext.highValue;

        const actualMinPrice = minPrice === this.defaultMinPrice ? '' : minPrice.toString();
        const actualMaxPrice = maxPrice === this.defaultMaxPrice ? '' : maxPrice.toString();

        if (actualMinPrice !== this.Filter.minPrice || actualMaxPrice !== this.Filter.maxPrice) {
            this.Filter.minPrice = actualMinPrice;
            this.Filter.maxPrice = actualMaxPrice;

            // filter
            this.startFilter();
        }
    }

    resetPriceRange() {
        this.minValue = this.defaultMinPrice;
        this.maxValue = this.defaultMaxPrice;
        this.Filter.minPrice = '';
        this.Filter.maxPrice = '';
        this.startFilter();
    }

    generateQueryParams() {
        const queryParams = {};
        for (const key in this.Filter) {
            if (this.Filter.hasOwnProperty(key) && this.Filter[key] !== '') {
                queryParams[key] = this.Filter[key];
            }
        }
        return queryParams;
    }

    startFilter(dropdown?) {

        // show loading icon
        this.reloadingItems = true;

        const queryParams = this.generateQueryParams();

        // change url
        const queryIndex = this.router.url.indexOf('?');
        const url = queryIndex === -1 ? this.router.url : this.router.url.substring(0, queryIndex);
        this.router.navigate([url], { queryParams , replaceUrl: true});

        // get new values
        this.vendorService.getProducts(this.Vendor.id, queryParams, 1, this.pagination.itemsPerPage)
        .subscribe(
            // success
            response => {
                if (queryParams.hasOwnProperty('category')) {
                    this.topLevel = false;
                } else {
                    this.topLevel = true;
                }

                this.processPageInfo(response);

                if (this.Filter.minPrice !== '') {
                    this.minValue = Number.parseInt(this.Filter.minPrice, 10);
                }
                if (this.Filter.maxPrice !== '') {
                    this.maxValue = Number.parseInt(this.Filter.maxPrice, 10);
                }
                this.reloadingItems = false;
            },

            // error
            error => {
                this.notify.error('Problem loading items, please try page.');
                this.reloadingItems = false;
            }
        );

        // remove drop down
        if (dropdown) {
            dropdown.hide();
        }
    }

    startFilter2(dropdown?) {
        const queryIndex = this.router.url.indexOf('?');
        const url = queryIndex === -1 ? this.router.url : this.router.url.substring(0, queryIndex);
        const queryParams = this.generateQueryParams();
        this.router.navigate([url], { queryParams , replaceUrl: false});

        // remove drop down
        if (dropdown) {
            dropdown.hide();
        }

        // show loading icon
        this.reloadingItems = true;
    }


    // SCROLL
    onScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;
            const queryParams = this.generateQueryParams();
            return this.vendorService.getProducts(this.Vendor.id, queryParams, this.pagination.currentPage,
            this.pagination.itemsPerPage).subscribe(
                // success
                response => {
                    this.pagination.currentPage = response.pagination.currentPage;
                    this.pagination.totalCount = response.pagination.totalCount;

                    const newProducts = response.result.products;
                    this.NewEntryCount = newProducts.length;

                    // add new propducts
                    for (const prod of newProducts) {
                        this.Products.push(prod);
                    }

                    // loading has completed successfully
                    this.backgroundLoadingItems = false;
                },

                // error
                error => {
                    this.notify.error('Problem loading items, please reload page.');
                    this.backgroundLoadingItems = false;
                }
            );
        }
    }


    // PRODUCT
    showProduct(event, Product: ProductListViewModel) {
        if (event.target.type !== 'button') {
            // show loaidng icon
            this.reloadingItems = true;

            // get product info
            this.productService.getProduct(Product.id).subscribe(
                // success
                reuslt => {
                    const initialState = {
                        Product: reuslt,
                        Service: this.DefaultGenericService ? this.DefaultGenericService : Product.service
                    };

                    // show modal
                    this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.modalConfig);
                    this.currentDialog.componentInstance.initialState = initialState;

                    // hide loaidng icon
                    this.reloadingItems = false;
                },

                // error
                error => {this.notify.error('Problem loading product information, please try again.');}
            );
        }
    }

    addToCart(Product: ProductListViewModel) {
        // show loading modal
        this.reloadingItems = true;

        if (this.cartService.addItem(Product, this.DefaultGenericService ? this.DefaultGenericService : Product.service)) {
            this.currentDialog = this.modalService.open(VisitorProductAddedComponent, this.successModalConfig);
            this.reloadingItems = false;
        } else {
            this.reloadingItems = false;
            this.notify.error('Problem adding item to cart, please try again.');
        }
    }


    // SEARCH
    globalSearch() {
        if (this.Search.searchTerm.trim().length > 0) {
            this.router.navigate(['/search', this.Search.section],
            { queryParams : { searchTerm : this.Search.searchTerm}});
        }
    }
}
