import { ProductListViewModel } from 'src/app/models/product';
import { ServiceViewModel } from 'src/app/models/service';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorCartService } from './../../services/visitor-cart.service';
import { VisitorProductListComponent } from './../visitor-product-list/visitor-product-list.component';
import { ProductViewModel } from './../../../models/product';
import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { OwlCarousel } from 'ngx-owl-carousel';
import { timer } from 'rxjs';
import { VisitorProductAddedComponent } from '../visitor-product-added/visitor-product-added.component';

@Component({
    selector: 'app-visitor-product-item',
    templateUrl: './visitor-product-item.component.html',
    styleUrls: ['./visitor-product-item.component.css']
})
export class VisitorProductItemComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() initialState: any;
    @Output() selectionStatusChanged = new EventEmitter<any>();

    @ViewChild('owlElement', {static: false}) owlElement: OwlCarousel;

    Product: ProductViewModel;
    Service: ServiceViewModel;

    adding = false;
    IsServiceForm = false;
    ShowCartButtons = true;
    Selected = false;

    SlideOptions = { items: 1, dots: true, nav: true, loop: true, autoplay: false, autoWidth: false,
        navText: ['<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>']};
    // onChange: (event) => {}};

    currentDialog;
    private modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: true
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private cartService: VisitorCartService,
                private notify: NotificationService) {}

    ngOnInit() {
        if (this.initialState) {
            if (this.initialState.Product) {
                this.Product = this.initialState.Product;
            } else {
                this.close();
            }

            if (this.initialState.Service) {
                this.Service = this.initialState.Service;
            }

            if (this.initialState.IsServiceForm !== undefined) {
                this.IsServiceForm = true;
                this.Selected = this.initialState.Selected;
            }

            if (this.initialState.ShowCartButtons !== undefined) {
                this.ShowCartButtons = this.initialState.ShowCartButtons;
            }
        } else {
            this.close();
        }
    }

    ngAfterViewInit() {
        const myTimer = timer(50); // 1000 millisecond means 1 seconds
        myTimer.subscribe(() => {
            this.owlElement.trigger('refresh.owl.carousel');
        });
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    gotoSlide(slideIndex: number) {
        this.owlElement.to([slideIndex]);
    }

    addToCart() {
        // show loading modal
        this.adding = true;

        // if successful, so pop-up
        const prod: ProductListViewModel = { id: this.Product.id, name: this.Product.name, price: this.Product.price,
            pictureUrl: this.Product.photos[0].url, prod_Category: this.Product.prod_Category};
        if (this.cartService.addItem(prod, this.Service)) {
            this.currentDialog = this.modalService.open(VisitorProductAddedComponent, this.modalConfig);
            this.adding = false;
        } else {
            this.adding = false;
            this.notify.error('Problem adding item to cart, please try again.');
        }
    }

    addItem() {
        this.Selected = true;
        this.selectionStatusChanged.emit(true);
    }

    removeItem() {
        this.Selected = false;
        this.selectionStatusChanged.emit(false);
    }

    close() {
        this.activeModal.dismiss();
    }

}
