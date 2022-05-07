import { ServiceLiteViewModel } from 'src/app/models/service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListViewModel } from 'src/app/models/product';
import { Pagination } from 'src/app/models/pagination';
import { VisitorProductService } from '../../services/visitor-product.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CategoryLiteViewModel, CategoryWithParentLiteViewModel } from 'src/app/models/category';
import { Options, ChangeContext } from 'ng5-slider';
import { VisitorProductItemComponent } from '../visitor-product-item/visitor-product-item.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitorProductAddedComponent } from '../visitor-product-added/visitor-product-added.component';
import { VisitorCartService } from '../../services/visitor-cart.service';

@Component({
    selector: 'app-visitor-product-list',
    templateUrl: './visitor-product-list.component.html',
    styleUrls: ['./visitor-product-list.component.css']
})
export class VisitorProductListComponent implements OnInit, OnDestroy {

    Service: ServiceLiteViewModel;
    Products: ProductListViewModel[];
    Categories: CategoryLiteViewModel[] = [];
    Category: CategoryWithParentLiteViewModel;
    ParentCategories: CategoryLiteViewModel[];
    NewEntryCount = -1;

    pagination: Pagination;

    Filter = {
        sort : '',
        category: '',
        minPrice: '',
        maxPrice: ''
    };
    filterActive = false;
    showFullLoadingIndicator = false;
    backgroundLoadingItems = false;
    topLevel = false;

    defaultMinPrice = 200;
    defaultMaxPrice = 12500;
    minValue = 200;
    maxValue = 12500;
    options: Options = {
        floor: 200,
        ceil: 12500
        /*translate: (value: number): string => {
            return '₦' + value;
        }*/
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
                private modalService: NgbModal,
                private actRoute: ActivatedRoute,
                private router: Router) {
        // set page title
        this.title.setTitle('Purchase Delivery | Quick Waka');

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

            // hide loading icon
            this.showFullLoadingIndicator = false;

            this.topLevel = data.items.topCategories !== undefined;
            this.processPageInfo(data.items.serviceInfo ? data.items.serviceInfo : data.items);
            this.Categories = data.items.topCategories ? data.items.topCategories.categories : this.Categories;

            // process filters
            this.Filter = {sort : '', category: '', minPrice: '', maxPrice: ''};
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
                    }
                }
            });
        });
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    processPageInfo(data) {
        this.pagination.currentPage = data.pagination.currentPage;
        this.pagination.totalCount = data.pagination.totalCount;

        this.Service = data.result.service;

        this.Products = data.result.products;

        this.defaultMinPrice = data.result.minPrice;
        this.defaultMaxPrice = data.result.maxPrice;
        this.minValue = data.result.minPrice;
        this.maxValue = data.result.maxPrice;
        this.options.floor = data.result.minPrice;
        this.options.ceil = data.result.maxPrice;

        this.Categories = this.topLevel ? this.Categories : data.result.childrenCategories;
        this.Category = !this.topLevel ? data.result.category : null;
        this.ParentCategories = [];
        if (this.Category) {
            let currentCat = this.Category;
            while (currentCat.parent) {
                this.ParentCategories.push({id: currentCat.parent.id, nameId: '', name: currentCat.parent.name});
                currentCat = currentCat.parent;
            }
            this.ParentCategories = this.ParentCategories.reverse();
        }
    }

    filter(option, value, dropdown) {
        value += '';
        // if filter has changed, then reload page
        if (this.Filter[option] !== value) {
            this.Filter[option] = value;
            this.startFilter(dropdown);
        }
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
        const queryIndex = this.router.url.indexOf('?');
        const url = queryIndex === -1 ? this.router.url : this.router.url.substring(0, queryIndex);
        const queryParams = this.generateQueryParams();
        this.router.navigate([url], { queryParams , replaceUrl: false});

        // remove drop down
        if (dropdown) {
            dropdown.hide();
        }

        // show loading icon
        // this.showFullLoadingIndicator = true;
    }


    onScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;
            const queryParams = this.generateQueryParams();

            const queryIndex = this.router.url.indexOf('?');
            const url = queryIndex === -1 ? this.router.url : this.router.url.substring(0, queryIndex);
            const serviceNameId = url.substr(url.lastIndexOf('/') + 1);

            return this.productService.getProducts(serviceNameId, queryParams, this.pagination.currentPage,
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


    showProduct(itemId: number) {
        // show loading icon
        this.showFullLoadingIndicator = true;

        // get product info
        this.productService.getProduct(itemId).subscribe(
             // success
             reuslt => {
                const initialState = {
                    Product: reuslt
                };

                // show modal
                this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.modalConfig);
                this.currentDialog.componentInstance.initialState = initialState;

                // hide loaidng icon
                this.showFullLoadingIndicator = false;
            },

            // error
            error => {this.notify.error('Problem loading product information, please try again.');}
        );
    }

    addToCart(event, selectedProduct: ProductListViewModel) {
        // show loading modal
        this.showFullLoadingIndicator = true;

        // cartservice.addItem(currentItem);
        const done = true; // this.cartService.addItem(selectedProduct);

        // if successful, so pop-up
        if (done) {
            this.currentDialog = this.modalService.open(VisitorProductAddedComponent, this.successModalConfig);
        }

        // hide loading modal
        this.showFullLoadingIndicator = false;

        // stop bubbling upwards
        event.stopPropagation();
    }
}
