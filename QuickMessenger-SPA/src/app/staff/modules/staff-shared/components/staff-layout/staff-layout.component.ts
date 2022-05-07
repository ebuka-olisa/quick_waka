import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './../../../../../services/auth.service';
import { Component, OnInit, AfterViewInit, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { MyUser } from 'src/app/models/user';
import * as $ from 'jquery';

@Component({
    selector: 'app-staff-layout',
    templateUrl: './staff-layout.component.html',
    styleUrls: ['./staff-layout.component.css']
})
export class StaffLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

    staff: MyUser;
    timeStamp: number;

    ActivePage: string;

    PageHeading: string;
    PageSubHeading: string;

    ShowBackButton: boolean;
    isProductMenuCollapsed = true;

    ParentUrl: string;
    HomeUrl: string;

    navigationSubscription;

    constructor(private authService: AuthService,
                private route: ActivatedRoute,
                private router: Router,
                private renderer: Renderer2) {
        // add css class to body
        this.renderer.addClass(document.body, 'staff-layout');
    }

    ngOnInit() {

        // get logged in user
        this.staff = this.authService.getUser();

        // configure menu
        this.adjustMenu(window);

        // get values to route to configure the layout
        this.processRoutingData();
    }

    ngOnDestroy() {
        // remove css from body
        this.renderer.removeClass(document.body, 'staff-layout');

        if (this.navigationSubscription) {
          this.navigationSubscription.unsubscribe();
        }
    }

    ngAfterViewInit() {
        this.navigationSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.processRoutingData();
            }
        });
    }

    processRoutingData() {
        const routeData = this.route.snapshot.data;
        const firstChildData = this.route.snapshot.firstChild.data;
        this.ShowBackButton = firstChildData.showBackButton !== null ? firstChildData.showBackButton : false;
        this.ParentUrl = this.ShowBackButton ? firstChildData.parentUrl : null;
        this.HomeUrl = routeData.home !== undefined ? routeData.home : null;
        this.ActivePage = routeData.activePage || firstChildData.activePage;
        if (this.ActivePage === 'products' || this.ActivePage === 'product_categories' || this.ActivePage === 'product_extra_attributes') {
            this.isProductMenuCollapsed = false;
        }
    }

    logOut() {
        this.authService.logout();
        this.router.navigate(['/qm-staff/login']);
    }


    // UI Operations
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.adjustMenu(event.target);
        /*setTimeout(() => {
            this.adjustMenu(event.target);
        }, 200);*/
    }

    toggleSidebar() {
        $('body').hasClass('mini-sidebar') ?
        (
            $('body').trigger('resize'),
            $('.scroll-sidebar, .slimScrollDiv').css('overflow', 'hidden').parent().css('overflow', 'visible'),
            $('body').removeClass('mini-sidebar'), $('.navbar-brand span').show()
        )
        :
        (
            $('body').trigger('resize'),
            $('.scroll-sidebar, .slimScrollDiv').css('overflow-x', 'visible').parent().css('overflow', 'visible'),
            $('body').addClass('mini-sidebar'), $('.navbar-brand span').hide()
        );
    }

    toggleHiddenSidebar() {
        $('body').toggleClass('show-sidebar'), $('.nav-toggler i').toggleClass('mdi mdi-menu'),
            $('.nav-toggler i').addClass('mdi mdi-close');
    }

    adjustMenu(window) {
        if (window.innerWidth >= 1170) {
            if ($('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize'),
                $('.scroll-sidebar, .slimScrollDiv').css('overflow', 'hidden').parent().css('overflow', 'visible'),
                $('body').removeClass('mini-sidebar'), $('.navbar-brand span').show();
            }
        } else {
            if (!$('body').hasClass('mini-sidebar')) {
                $('body').trigger('resize'),
                $('.scroll-sidebar, .slimScrollDiv').css('overflow-x', 'visible').parent().css('overflow', 'visible'),
                $('body').addClass('mini-sidebar'), $('.navbar-brand span').hide();
            }
        }
    }

    onActivate(event) {
        window.scroll(0, 0);
        // or document.body.scrollTop = 0;
        // or document.querySelector('body').scrollTo(0,0)
    }


    // User Info
    getUserProfileImage() {
        if (this.timeStamp && this.staff.photoUrl) {
            return this.staff.photoUrl + '?' + this.timeStamp;
        }
        return this.staff.photoUrl;
    }

    refreshUserInfo() {
        this.authService.clearCurrentUser();
        this.timeStamp = (new Date()).getTime();
        this.staff = this.authService.getUser();
    }

}
