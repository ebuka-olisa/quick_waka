import { Component, OnInit } from '@angular/core';
import { LoginUser } from 'src/app/models/user';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { StaffLoginService } from '../../staff-login.service';

@Component({
  selector: 'app-staff-login',
  templateUrl: './staff-login.component.html',
  styleUrls: ['./staff-login.component.css']
})
export class StaffLoginComponent implements OnInit {

  User: LoginUser;
  validationErrors: any[] = [];
  fieldErrors: any = {};
  returnUrl: string;
  processing = false;

  constructor(private loginService: StaffLoginService,
              private titleService: Title,
              private validationErrorService: ValidationErrorService,
              private router: Router,
              private route: ActivatedRoute,
              private notificationService: NotificationService) {
    this.titleService.setTitle('Staff Login | Quick Waka');
    this.User = new LoginUser();
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/qm-staff';
  }

  signin() {
    this.processing = true;
    this.validationErrors = [];
    this.fieldErrors = {};

    this.loginService.signIn(this.User)
      .subscribe(

        // success
        () => {
          debugger;
          this.notificationService.clearAll();
          this.router.navigate([this.returnUrl]);
          this.processing = false;
        },

        // error
        error => {
          debugger;
          const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
          this.validationErrors = allErrors.validationErrors;
          this.fieldErrors = allErrors.fieldErrors;
          if (!this.fieldErrors.Username && !this.fieldErrors.Password) {
            this.validationErrors.push('Invalid account details');
          }
          this.processing = false;
        }
      );
  }
}
