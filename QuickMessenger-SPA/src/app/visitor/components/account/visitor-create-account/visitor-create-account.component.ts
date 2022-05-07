import { Component, OnInit, ViewChild } from '@angular/core';
import { Ng2TelInput } from 'ng2-tel-input';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { RegisterUser, ForgotUserPassword } from 'src/app/models/user';
import { Subscription, Observable, timer } from 'rxjs';
import { VisitorAccountService } from 'src/app/visitor/services/visitor-account.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthService as SocialAuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angular5-social-login';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-visitor-create-account',
    templateUrl: './visitor-create-account.component.html',
    styleUrls: ['./visitor-create-account.component.css']
})
export class VisitorCreateAccountComponent implements OnInit {
    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    User: RegisterUser;
    TempPhone: string;
    returnUrl: string;

    closeAfterSignin = false;
    channelName: string;
    queryParams = {};

    processing = false;
    validationErrors: any[] = [];
    fieldErrors: any = {};

    completed = false;
    resending = false;
    timer: Observable<any>;
    subscription: Subscription;
    ResendConfirmationStatus = {
        success : false,
        error : false
    };

    PasswordSettings = {
        displayText: 'Show',
        displayType: 'password'
    };

    constructor(private title: Title,
                private route: ActivatedRoute,
                private router: Router,
                private authService: AuthService,
                private socialAuthService: SocialAuthService,
                private accountService: VisitorAccountService,
                private validationErrorService: ValidationErrorService,
                private notification: NotificationService) {

        // set page title
        this.title.setTitle('Create Account | Quick Waka');
        this.User = new RegisterUser();
        this.User.gender = 'female';
    }

    ngOnInit() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

        // get logged in user
        if (this.authService.getUser()) {
            this.router.navigate(['/']);
        }

        // get query params if any
        this.route.queryParams.subscribe(params => {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    if (key === 'pre' && params[key] === 'imp') {
                        this.closeAfterSignin = true;
                    } else if (key === 'ch') {
                        this.channelName = params[key];
                    }
                    this.queryParams[key] = params[key];
                }
            }
        });
    }


    // Password operations
    togglePasswordVisibitiy() {
        if (this.PasswordSettings.displayText === 'Show') {
            this.PasswordSettings.displayText = 'Hide';
            this.PasswordSettings.displayType = 'text';
        } else {
            this.PasswordSettings.displayText = 'Show';
            this.PasswordSettings.displayType = 'password';
        }
    }


    // Phone operations
    checkPhoneError() {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.Phone = null;
            } else {
                this.fieldErrors.Phone = 'Enter a valid phone number';
                // this.User.phone = null;
            }
        } else {
            this.fieldErrors.Phone = 'Enter a valid phone number';
            // this.User.phone = null;
        }
    }

    getNumber(obj: string) {
        this.User.phone = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }


    register() {
        this.processing = true;
        this.validationErrors = [];
        this.fieldErrors = {};
        let error = false;

        if (!this.User.lastName || this.User.lastName.trim() === '') {
            this.fieldErrors.LastName = 'Enter your last name/surname';
            error = true;
        }
        if (!this.User.firstName || this.User.firstName.trim() === '') {
            this.fieldErrors.FirstName = 'Enter your first name';
            error = true;
        }
        if (!this.User.gender || this.User.gender.trim() === '') {
            this.fieldErrors.Gender = 'Select your gender';
            error = true;
        }
        if (!this.User.email || this.User.email.trim() === '') {
            this.fieldErrors.Email = 'Enter your email address';
            error = true;
        }
        if (!this.User.phone || this.User.phone.trim() === '') {
            this.fieldErrors.Phone = 'Enter your phone number';
            error = true;
        } else if (!this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = 'Enter a valid phone number';
            error = true;
        }
        if (!this.User.password || this.User.password.trim() === '') {
            this.fieldErrors.Password = 'Enter your password';
            error = true;
        }

        if (error) {
            this.processing = false;
        } else {
            this.accountService.registerUser(this.User)
            .subscribe(

                // success
                (response) => {
                    this.processing = false;
                    this.completed = true;
                },

                // error
                errors => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error) {
                        if (this.fieldErrors.error.indexOf('email') !== - 1) {
                            this.fieldErrors.Email = this.fieldErrors.error;
                        }
                        if (this.fieldErrors.error.indexOf('phone') !== - 1) {
                            this.fieldErrors.Phone = this.fieldErrors.error;
                        }
                    }
                    this.processing = false;
                }
            );
        }
    }

    resendConfirmationEmail() {
        this.resending = true;
        const resendUser = new ForgotUserPassword();
        resendUser.username = this.User.email;
        this.accountService.resendConfirmationEmail(resendUser)
            .subscribe(

                // success
                (response) => {
                    this.setResendResultTimer(true);
                    this.resending = false;
                },

                // error
                errors => {
                    this.setResendResultTimer(false);
                    this.resending = false;
                }
            );
    }

    setResendResultTimer(success: boolean) {
        success ? this.ResendConfirmationStatus.success = true : this.ResendConfirmationStatus.error = true;

        this.timer  = timer(2000); // 2000 millisecond means 2 seconds
        this.subscription = this.timer.subscribe(() => {
            // set showloader to false to hide loading div from view after 5 seconds
            success ? this.ResendConfirmationStatus.success = false : this.ResendConfirmationStatus.error = false;
        });
    }


    // SOCIAL MEDIA SIGN UP
    signInWithGoogle(): void {
        this.socialSignIn(GoogleLoginProvider.PROVIDER_ID);
    }

    signInWithFB(): void {
        this.socialSignIn(FacebookLoginProvider.PROVIDER_ID);
    }

    socialSignIn(socialPlatformProvider: string) {
        this.socialAuthService.signIn(socialPlatformProvider).then(
            // success
            (userData) => {
                if (userData !== null) {
                    if (userData.provider === 'google') {
                        userData.token = userData.idToken;
                    }
                    this.accountService.externalSignIn(userData.token, userData.provider).subscribe(
                        () => {
                            // this.parentComponent.refreshUserInfo();

                            // do I need to close this tab
                            if (this.closeAfterSignin && this.channelName) {
                                const channel = new BroadcastChannel(this.channelName);
                                channel.postMessage('success');
                                window.close();
                            } else {
                                this.router.navigate([this.returnUrl]);
                            }
                        },
                        error => {
                            this.notification.error('Problem occurred while attempting sign in, please try again');
                        }
                    );
                  }
            },

            // error
            errors => {
                this.notification.error('Problem occurred while attempting sign in, please try again');
            }
        );
    }
}
