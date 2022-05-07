import { MyUser } from 'src/app/models/user';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-visitor-my-account',
  templateUrl: './visitor-my-account.component.html',
  styleUrls: ['./visitor-my-account.component.css']
})
export class VisitorMyAccountComponent implements OnInit, OnDestroy, AfterViewInit {

    ActivePage: string;
    User: MyUser;
    AllowPasswordChange = false;

    navigationSubscription;
    showLoadingIndicator = false;
    showFullTransparentLoadingIndicator = false;

    constructor(private authService: AuthService,
                private router: Router,
                private route: ActivatedRoute) {}

    ngOnInit() {
        // get values to route to configure the layout
        this.processRoutingData();

        this.User  = this.authService.getUser();
        this.AllowPasswordChange = this.User.loginType === 'username';
    }

    ngOnDestroy() {
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
        this.ActivePage = routeData.activePage || firstChildData.activePage;
    }
}
