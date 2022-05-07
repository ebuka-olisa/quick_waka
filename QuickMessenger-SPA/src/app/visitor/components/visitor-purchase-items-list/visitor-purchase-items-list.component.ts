import { CartProductViewModel } from './../../../models/product';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorProductService } from './../../services/visitor-product.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pagination } from 'src/app/models/pagination';
import { Options, ChangeContext } from 'ng5-slider';
import { ProductListViewModel } from 'src/app/models/product';
import { CategoryLiteViewModel, CategoryWithParentLiteViewModel } from 'src/app/models/category';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { VisitorProductItemComponent } from '../visitor-product-item/visitor-product-item.component';

@Component({
  selector: 'app-visitor-purchase-items-list',
  templateUrl: './visitor-purchase-items-list.component.html',
  styleUrls: ['./visitor-purchase-items-list.component.css']
})
export class VisitorPurchaseItemsListComponent implements OnInit, OnDestroy {

    @Input() initialState: any;
    @Output() itemsSelected = new EventEmitter<any>();

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Products: ProductListViewModel[];
    SelectedProducts: CartProductViewModel[];
    Categories: CategoryLiteViewModel[] = [];
    TopLevelCategories: CategoryLiteViewModel[] = [];
    Category: CategoryWithParentLiteViewModel;
    ParentCategories: CategoryLiteViewModel[];
    ServiceNameId: string;
    NewEntryCount = -1;

    pagination: Pagination;
    Filter = {
        searchTerm: '',
        sort : '',
        category: '',
        minPrice: '',
        maxPrice: ''
    };
    filterActive = false;
    topLevel: boolean;

    defaultMinPrice = 200;
    defaultMaxPrice = 12500;
    minValue = 200;
    maxValue = 12500;
    options: Options = {
        floor: 200,
        ceil: 12500
    };

    showFullTransparentLoadingIndicator = false;
    backgroundLoadingItems = false;

    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private activeModal: NgbActiveModal,
                private productService: VisitorProductService,
                private notify: NotificationService,
                private modalService: NgbModal) {

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
        this.topLevel = true;

        if (this.initialState) {
            if (this.initialState.TopCategories) {
                this.TopLevelCategories = this.initialState.TopCategories.categories;
            }

            if (this.initialState.ServiceNameId) {
                this.ServiceNameId = this.initialState.ServiceNameId;
            }

            if (this.initialState.ItemsInfo) {
                const data = this.initialState.ItemsInfo;
                this.defaultMinPrice = data.result.minPrice;
                this.defaultMaxPrice = data.result.maxPrice;
                this.minValue = data.result.minPrice;
                this.maxValue = data.result.maxPrice;
                this.options.floor = data.result.minPrice;
                this.options.ceil = data.result.maxPrice;
                this.processData(data);
            }

            if (this.initialState.SelectedProducts) {
                this.SelectedProducts = JSON.parse(JSON.stringify(this.initialState.SelectedProducts));
            } else {
                this.SelectedProducts = [];
            }
        } else {
            this.SelectedProducts = [];
        }

        this.setupSearch();
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    processData(data) {
        this.pagination.currentPage = data.pagination.currentPage;
        this.pagination.totalCount = data.pagination.totalCount;

        this.Products = data.result.products;

        this.Categories = this.topLevel ? this.TopLevelCategories : data.result.childrenCategories;
        this.Category = !this.topLevel ? data.result.category : null;
    }

    close() {
        this.activeModal.dismiss();
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
                return this.productService.getProducts(this.ServiceNameId, queryParams, 1, this.pagination.itemsPerPage);
            })
        ).subscribe(response => {

            this.processData(response);

            if (this.Filter.minPrice !== '') {
                this.minValue = Number.parseInt(this.Filter.minPrice, 10);
            }
            if (this.Filter.maxPrice !== '') {
                this.maxValue = Number.parseInt(this.Filter.maxPrice, 10);
            }
            this.showFullTransparentLoadingIndicator = false;
            // this.pagination.currentPage = response.pagination.currentPage;
            // this.pagination.totalCount = response.pagination.totalCount;

            // this.Services = response.result;

            // this.contentLoading = false;
        });
    }

    search(term: string): void {
        this.showFullTransparentLoadingIndicator = true;
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
        this.filterActive = false;
        const queryParams = {};
        for (const key in this.Filter) {
            if (this.Filter.hasOwnProperty(key) && this.Filter[key] !== '') {
                this.filterActive = true;
                queryParams[key] = this.Filter[key];
            }
        }
        return queryParams;
    }

    startFilter(dropdown?) {
        this.showFullTransparentLoadingIndicator = true;

        const queryParams = this.generateQueryParams();
        this.productService.getProducts(this.ServiceNameId, queryParams, 1, this.pagination.itemsPerPage)
        .subscribe(
            // success
            response => {
                if (queryParams.hasOwnProperty('category')) {
                    this.topLevel = false;
                } else {
                    this.topLevel = true;
                }

                this.processData(response);

                if (this.Filter.minPrice !== '') {
                    this.minValue = Number.parseInt(this.Filter.minPrice, 10);
                }
                if (this.Filter.maxPrice !== '') {
                    this.maxValue = Number.parseInt(this.Filter.maxPrice, 10);
                }
                this.showFullTransparentLoadingIndicator = false;
            },

            // error
            error => {
                this.notify.error('Problem loading items, please try page.');
                this.showFullTransparentLoadingIndicator = false;
            }
        );

        // remove drop down
        if (dropdown) {
            dropdown.hide();
        }
    }



    onScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;

            const queryParams = this.generateQueryParams();
            this.productService.getProducts(this.ServiceNameId, queryParams, this.pagination.currentPage, this.pagination.itemsPerPage)
            .subscribe(
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


    // ITEM SELECTION
    addItem(event, selectedProduct: ProductListViewModel) {
        // show loading modal
        const newItem = new CartProductViewModel();
        newItem.id = selectedProduct.id;
        newItem.name = selectedProduct.name;
        newItem.pictureUrl = selectedProduct.pictureUrl;
        newItem.price = selectedProduct.price;
        newItem.vendor = selectedProduct.vendor;
        newItem.quantity = 1;
        this.SelectedProducts.push(newItem);

        // stop bubbling upwards
        if (event) {
            event.stopPropagation();
        }
    }

    itemAdded(selectedProduct: ProductListViewModel) {
        return this.SelectedProducts.findIndex(x => x.id === selectedProduct.id) !== -1;
    }

    removeItem(event, selectedProduct: ProductListViewModel) {
        const index = this.SelectedProducts.findIndex(x => x.id === selectedProduct.id);
        this.SelectedProducts.splice(index, 1);

        // stop bubbling upwards
        if (event) {
            event.stopPropagation();
        }
    }

    showProduct(selectedProduct: ProductListViewModel) {
        // show loading icon
        this.showFullTransparentLoadingIndicator = true;

        // get product info
        this.productService.getProduct(selectedProduct.id).subscribe(
             // success
             result => {
                const initialState = {
                    Product: result,
                    Selected: this.itemAdded(selectedProduct),
                    IsServiceForm: true
                };

                // show modal
                this.currentDialog = this.modalService.open(VisitorProductItemComponent, this.modalConfig);
                this.currentDialog.componentInstance.initialState = initialState;
                this.currentDialog.componentInstance.selectionStatusChanged.subscribe(
                    (status) => {
                        if (status) {
                            this.addItem(null, selectedProduct);
                        } else {
                            this.removeItem(null, selectedProduct);
                        }
                    }
                );

                // hide loaidng icon
                this.showFullTransparentLoadingIndicator = false;
            },

            // error
            error => {this.notify.error('Problem loading product information, please try again.');}
        );
    }

    saveSelection() {
        this.itemsSelected.emit(this.SelectedProducts);
    }

}
