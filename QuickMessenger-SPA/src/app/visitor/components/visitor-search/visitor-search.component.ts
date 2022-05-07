import { VisitorVendorService } from './../../services/visitor-vendor.service';
import { VisitorCartService } from './../../services/visitor-cart.service';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Pagination } from 'src/app/models/pagination';
import { Options, ChangeContext } from 'ng5-slider';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListViewModel } from 'src/app/models/product';
import { VendorLiteViewModel, VendorGroupViewModel } from 'src/app/models/vendor';
import { timer } from 'rxjs';
import { VisitorProductService } from '../../services/visitor-product.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CategoryLiteViewModel, CategoryWithParentLiteViewModel } from 'src/app/models/category';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitorProductItemComponent } from '../visitor-product-item/visitor-product-item.component';
import { VisitorProductAddedComponent } from '../visitor-product-added/visitor-product-added.component';
import { ServiceViewModel } from 'src/app/models/service';

@Component({
    selector: 'app-visitor-search',
    templateUrl: './visitor-search.component.html',
    styleUrls: ['./visitor-search.component.css']
})
export class VisitorSearchComponent implements OnInit, OnDestroy {
    @ViewChild('searchTab', {static: false}) searchTab: TabsetComponent;

    Products: ProductListViewModel[];
    Categories: CategoryLiteViewModel[] = [];
    TopLevelCategories: CategoryLiteViewModel[] = [];
    Category: CategoryWithParentLiteViewModel;
    Vendors: VendorLiteViewModel[];

    VendorGroups: VendorGroupViewModel[];

    searchTerm: string;
    Search = {
        section: 'products',
        searchTerm: ''
    };

    CurrentSection = 'products';
    NewEntryCount = -1;
    topLevel = false;
    backgroundLoadingItems = false;
    reloadingItems = false;

    Filter = {
        searchTerm: '',
        sort : '',
        category: '',
        minPrice: '',
        maxPrice: ''
    };
    filterActive = false;
    pagination: Pagination;

    DefaultGenericService: ServiceViewModel;

    defaultMinPrice = 200;
    defaultMaxPrice = 12500;
    minValue = 200;
    maxValue = 12500;
    options: Options = {
        floor: 200,
        ceil: 12500
    };

    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };
    private successModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: true
    };

    constructor(private title: Title,
                private productService: VisitorProductService,
                private notify: NotificationService,
                private cartService: VisitorCartService,
                private vendorService: VisitorVendorService,
                private modalService: NgbModal,
                private actRoute: ActivatedRoute,
                private router: Router) {

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 48,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit() {
        this.actRoute.data.subscribe(data => {
            this.NewEntryCount = -1;
            if (data.items.section === 'products') {

                this.DefaultGenericService = data.items.defaultGeneric;

                this.topLevel = true;
                this.TopLevelCategories = data.items.topCategories ? data.items.topCategories.categories : [];

                this.defaultMinPrice = data.items.result.result.minPrice;
                this.defaultMaxPrice = data.items.result.result.maxPrice;
                this.minValue = data.items.result.result.minPrice;
                this.maxValue = data.items.result.result.maxPrice;
                this.options.floor = data.items.result.result.minPrice;
                this.options.ceil = data.items.result.result.maxPrice;

                this.Search.section = 'products';
                this.CurrentSection = 'products';
            } else {
                this.Search.section = 'vendors';
                this.CurrentSection = 'vendors';
            }

            // process filters
            this.Filter = {searchTerm: '', sort : '', category: '', minPrice: '', maxPrice: ''};
            this.actRoute.queryParams.subscribe(params => {
                for (const key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (this.Filter.hasOwnProperty(key)) {
                            if (key !== 'searchTerm') {
                                this.filterActive = true;
                            }
                            if (data.items.section === 'products') {
                                this.Filter[key] = params[key];
                                if (key === 'minPrice') {
                                    this.minValue = params[key];
                                } else if (key === 'maxPrice') {
                                    this.maxValue = params[key];
                                }
                            }
                            if (key === 'searchTerm') {
                                this.searchTerm = params[key];
                            }
                        }
                    }
                }
            });

            // set page title
            this.title.setTitle(`Search: ${this.searchTerm} | Quick Waka`);

            // process information
            this.processPageInfo(data.items.result, data.items.section);
        });
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    processPageInfo(data, section) {
        if (data && data.pagination) {
            this.pagination.currentPage = data.pagination.currentPage;
            this.pagination.totalCount = data.pagination.totalCount;
        }

        /*const myTimer  = timer(400); // 2000 millisecond means 2 seconds
        let tabIndex = 0;
        if (section === 'vendors') {
            tabIndex = 1;
        }
        myTimer.subscribe(() => {
            this.searchTab.tabs[tabIndex].active = true;
        });*/

        if (section === 'products') {
            this.processProductInfo(data);
        } else {
            this.processVendorInfo(data);
        }
    }

    processProductInfo(data) {
        this.Products = data.result.products;

        this.Categories = this.topLevel ? this.TopLevelCategories : data.result.childrenCategories;
        this.Category = !this.topLevel ? data.result.category : null;
    }

    processVendorInfo(data) {
        this.Vendors = data.result;

        this.VendorGroups = [];
        this.groupVendors(this.Vendors);

        // this.Categories = this.topLevel ? this.TopLevelCategories : data.result.childrenCategories;
        // this.Category = !this.topLevel ? data.result.category : null;
    }

    groupVendors(vendorList) {
        for (const Vend of vendorList) {
            const firstLetter = Vend.name.substr(0, 1);
            let group = this.VendorGroups.find(x => x.title === firstLetter);
            if (!group) {
                group = new VendorGroupViewModel(firstLetter);
                this.VendorGroups.push(group);
            }
            group.vendors.push(Vend);
        }
    }

    changeTab(data: TabDirective): void {
        const queryParams = {searchTerm: this.searchTerm};
        if (data.id === 'product_tab') {
            this.router.navigate(['/search', 'products'], { queryParams, replaceUrl: true});
        } else {
            this.router.navigate(['/search', 'vendors'], { queryParams, replaceUrl: true});
        }
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
        this.productService.searchProducts(queryParams, 1, this.pagination.itemsPerPage)
        .subscribe(
            // success
            response => {
                if (queryParams.hasOwnProperty('category')) {
                    this.topLevel = false;
                } else {
                    this.topLevel = true;
                }

                this.processPageInfo(response, 'products');

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

    onScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;
            const queryParams = this.generateQueryParams();
            return this.productService.searchProducts(queryParams, this.pagination.currentPage, this.pagination.itemsPerPage).subscribe(
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


    // VENDOR
    onVendorScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;

            return this.vendorService.searchVendors({searchTerm: this.searchTerm}, this.pagination.currentPage,
                this.pagination.itemsPerPage).subscribe(
                // success
                response => {
                    this.pagination.currentPage = response.pagination.currentPage;
                    this.pagination.totalCount = response.pagination.totalCount;

                    const newVendors = response.result;
                    this.NewEntryCount = newVendors.length;

                    // add new vendors
                    for (const vend of newVendors) {
                        this.Vendors.push(vend);
                    }
                    this.groupVendors(newVendors);

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


    // SEARCH
    globalSearch() {
        if (this.Search.searchTerm.trim().length > 0) {
            location.href = '/search/' + this.Search.section + '?searchTerm=' + this.Search.searchTerm;
            // this.router.navigate(['/search', this.Search.section],
            // { queryParams : { searchTerm : this.Search.searchTerm}});
        }
    }

}
