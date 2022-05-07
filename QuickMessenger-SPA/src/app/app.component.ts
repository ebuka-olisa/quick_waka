import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'Quick Waka';

  loadingView: boolean;
  navigationSubscription;

  constructor(private router: Router) {
    this.loadingView = true;
  }

  ngAfterViewInit() {
    this.navigationSubscription = this.router.events
        .subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.loadingView = true;
                // this.notificationService.clearAllToasts();
            } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
                this.loadingView = false;
            }
        });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
