import { VisitorCartService } from 'src/app/visitor/services/visitor-cart.service';
import { ServiceLiteViewModel } from 'src/app/models/service';
import { VisitorGeneralService } from './../../services/visitor-general.service';
import { Component, OnInit, Renderer2, OnDestroy, HostListener, AfterViewInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MyUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { timer } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap';

@Component({
    selector: 'app-visitor-layout',
    templateUrl: './visitor-layout.component.html',
    styleUrls: ['./visitor-layout.component.css']
})
export class VisitorLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('dropdown', {static: false}) mobileDropdown: BsDropdownDirective;

    user: MyUser;
    Services: ServiceLiteViewModel[];

    isDropDownOpen = true;
    shrinkNav = false;
    childHasHover = false;
    allowHoverDrop = true;

    AccountPage = false;
    CheckoutPage = false;
    HideCheckoutTitle = false;
    MyAccountPage = false;
    GrayFlex = false;

    OrderCount: number|string;

    navigationSubscription;
    announcementSubscription;

    constructor(private renderer: Renderer2,
                private router: Router,
                private route: ActivatedRoute,
                private authService: AuthService,
                private generalService: VisitorGeneralService,
                private cartService: VisitorCartService) {
        // add css class to body
        this.renderer.addClass(document.body, 'visitor-layout');
    }

    ngOnInit() {
        // get logged in user
        this.user = this.authService.getUser();

        // get list of services
        this.generalService.getAllServices().subscribe(response => {
            this.Services = response;
        });

        // configure menu visibility
        this.toggleMenuVisibility(window);

        // handle outside clicks
        this.handleOutsideClicks();

        // get values to route to configure the layout
        this.processRoutingData();

        // listen for changes to user storage token
        window.onstorage = (e: StorageEvent) => {
            if (e.key === 'user') {
                if (!e.newValue || e.newValue === null) {
                    this.authService.clearCurrentUser();
                }
                this.user = this.authService.getUser();
            }
            if (e.key === 'cart') {
                this.getOrderCount();
            }
        };

        // listen for changes to cart
        this.announcementSubscription = this.cartService.getAnnouncement().subscribe(message => { this.getOrderCount(); });

        // get cart
        this.getOrderCount();
    }

    ngOnDestroy() {
        // remove css from body
        this.renderer.removeClass(document.body, 'visitor-layout');

        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }

        // unsubscribe to ensure no memory leaks
        if (this.announcementSubscription) {
            this.announcementSubscription.unsubscribe();
        }
    }


    ngAfterViewInit() {
        this.navigationSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.processRoutingData();
                this.hideAllDropDowns();
            }
        });

        // configure sub-menus
        this.resizeMenu();
    }

    processRoutingData() {
        const routeData = this.route.snapshot.data;
        const firstChildData = this.route.snapshot.firstChild.data;
        this.AccountPage = routeData.accountPage || firstChildData.accountPage;
        this.MyAccountPage = routeData.myAccountPage || firstChildData.myAccountPage;
        this.CheckoutPage = routeData.checkOutPage || firstChildData.checkOutPage;
        if (this.CheckoutPage) {
            const innerChildData = this.route.snapshot.firstChild.firstChild ? this.route.snapshot.firstChild.firstChild.data : null;
            this.HideCheckoutTitle =  routeData.hideCheckoutTitle || firstChildData.hideCheckoutTitle
                || (innerChildData && innerChildData.hideCheckoutTitle);
        }
        this.GrayFlex = routeData.grayFlex || firstChildData.grayFlex;
    }

    getOrderCount() {
        const Cart = this.cartService.getCart();
        this.OrderCount = 0;
        if (Cart && Cart.serviceOrders && Cart.serviceOrders.length > 0) {
            for (const serviceForm of Cart.serviceOrders) {
                this.OrderCount += serviceForm.orders ? serviceForm.orders.length : 0;
            }
        }
    }


    refreshUserInfo() {
        this.authService.clearCurrentUser();
        this.user = this.authService.getUser();
    }

    logOut() {
        this.authService.logout();
        this.cartService.emptyCart(false);
        // this.user = null;
        // this.router.navigate(['/']);
        window.location.href = '/';
    }


    // UI Operations
    onActivate(event) {
        window.scroll(0, 0);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.toggleMenuVisibility(event.target);
        setTimeout(() => {
            this.resizeMenu();
        }, 200);
    }

    toggleMenuVisibility(window) {
        if (window.innerWidth >= 992) {
            this.isDropDownOpen = true;
            this.allowHoverDrop = true;
        } else {
            this.isDropDownOpen = false;
            this.allowHoverDrop = false;
        }
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event) {
        if (window.pageYOffset > 10) {
            this.shrinkNav = true;
        } else {
            this.shrinkNav = false;
        }
    }

    resizeMenu() {
        const width = $('nav.navbar').children('div.container').width();
        $('ul.mega-menu-full').css('width', width + 'px');
        $('ul.mega-menu-full').each((e) => {
            $(this).css('width', width + 'px');
        });
    }

    toggleDropDownIcon(event) {
        let icon;
        const target =  $(event.target);
        icon = target.is('i') || target.is('span') ? target.parent().find('span+i') : target.find('span+i');
        if (icon.hasClass('fa-angle-down')) {
            icon.removeClass('fa-angle-down');
            icon.addClass('fa-angle-up');
        } else {
            icon.removeClass('fa-angle-up');
            icon.addClass('fa-angle-down');
        }
    }

    handleOutsideClicks() {
        $('body').on('touchstart click',  (e) => {
            const dropdown = $('.dropdown-menu.show');
            if (dropdown[0]) {
                if ($.contains(dropdown[0], e.target) || dropdown[0].id === e.target.id) {
                    e.stopPropagation();
                }
                const icon  = dropdown.parent().find('a').find('span+i');
                icon.removeClass('fa-angle-up');
                icon.addClass('fa-angle-down');
            }
        });
    }

    showDropDown(event) {
        if (this.allowHoverDrop) {
            const dropdownToggle = $(event.target);
            const dropdown = dropdownToggle.parent();
            const dropdownMenu = dropdown.find('.dropdown-menu');
            const showClass = 'show';

            dropdown.addClass(showClass);
            dropdownToggle.attr('aria-expanded', 'true');
            dropdownMenu.addClass(showClass);

            dropdownMenu.on('mouseenter', () => { this.childHasHover = true; });
            dropdownMenu.on('mouseleave', () => { this.childHasHover = false; this.hideDropDownFromMenu(dropdownMenu); });
        }
    }

    hideDropDown(event) {
        if (this.allowHoverDrop) {
            const myTimer = timer(100); // 1000 millisecond means 1 seconds
            myTimer.subscribe(() => {
                if (!this.childHasHover) {
                    const dropdownToggle = $(event.target);
                    const dropdown = dropdownToggle.parent();
                    const dropdownMenu = dropdown.find('.dropdown-menu');
                    const showClass = 'show';

                    dropdown.removeClass(showClass);
                    dropdownToggle.attr('aria-expanded', 'false');
                    dropdownMenu.removeClass(showClass);
                }
            });
        }
    }

    hideDropDownFromMenu(dropdownMenu) {
        const myTimer = timer(100); // 1000 millisecond means 1 seconds
        myTimer.subscribe(() => {
            if (!this.childHasHover) {
                const dropdown = dropdownMenu.parent();
                const dropdownToggle = dropdown.find('a');
                const showClass = 'show';

                dropdown.removeClass(showClass);
                dropdownToggle.attr('aria-expanded', 'false');
                dropdownMenu.removeClass(showClass);
            }
        });
    }

    hideAllDropDowns() {
        // hide dropdown (PC View)
        const showClass = 'show';
        const showClass2 = 'open';
        const menuItemDropDownHolder = $('.simple-dropdown');
        if (menuItemDropDownHolder.hasClass(showClass)) {
            const menuItemDropDownToggle = menuItemDropDownHolder.find('a');
            const menuItemDropDownMenu = menuItemDropDownHolder.find('.dropdown-menu');
            menuItemDropDownHolder.removeClass(showClass);
            menuItemDropDownToggle.attr('aria-expanded', 'false');
            menuItemDropDownMenu.removeClass(showClass);
        }

        // hide dropdown (Mobile View)
        if (this.mobileDropdown && this.mobileDropdown.isOpen) {
            this.mobileDropdown.hide();
        }
    }
}
