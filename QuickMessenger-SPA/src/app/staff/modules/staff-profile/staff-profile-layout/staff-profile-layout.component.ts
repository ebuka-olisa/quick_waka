import { StaffViewModel } from 'src/app/models/staff';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-staff-profile-layout',
    templateUrl: './staff-profile-layout.component.html',
    styleUrls: ['./staff-profile-layout.component.css']
})
export class StaffProfileLayoutComponent implements OnInit, AfterViewInit {

    User: StaffViewModel;

    ActiveView: string;

    constructor(private actRoute: ActivatedRoute,
                private router: Router,
                private notify: NotificationService,
                private authService: AuthService,
                private parentComponent: StaffLayoutComponent,
                titleService: Title) {

        // set page title
        titleService.setTitle('Profile | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Profile';
        parentComponent.PageSubHeading = '';
    }

    ngOnInit() {
        this.actRoute.data.subscribe(data => {
            this.User = data.user;
            // this.Picture = this.User.photoUrl && this.User.photoUrl !== '' ? this.User.photoUrl : 'assets/images/unknown.jpg';
        });

        // get values to route to configure the layout
        this.processRoutingData();
    }

    ngAfterViewInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.processRoutingData();
            }
        });
    }

    processRoutingData() {
        const routeData = this.actRoute.snapshot.data;
        const firstChildData = this.actRoute.snapshot.firstChild.data;
        // this.ShowBackButton = firstChildData.showBackButton !== null ? firstChildData.showBackButton : false;
        // this.ParentUrl = this.ShowBackButton ? firstChildData.parentUrl : null;
        // this.HomeUrl = routeData.home !== undefined ? routeData.home : null;
        this.ActiveView = routeData.activeView || firstChildData.activeView;
    }

    updateProfile(userInfo: StaffViewModel, token) {
        // show success information
        this.notify.success('Profile was updated successfully!');

        // update user information
        this.User = JSON.parse(JSON.stringify(userInfo));

        // update navigation menu information
        // TODO: Update navigation menu information after profile update
        if (token && token !== '') {
            this.authService.setToken(JSON.stringify(token));
            this.parentComponent.refreshUserInfo();
        }
    }

    onActivate(event) {
        window.scroll(0, 0);
        // or document.body.scrollTop = 0;
        // or document.querySelector('body').scrollTo(0,0)
    }

}
