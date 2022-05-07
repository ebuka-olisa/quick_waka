import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { LoginUser } from 'src/app/models/user';
import { VisitorAccountService } from 'src/app/visitor/services/visitor-account.service';
import { AuthService as SocialAuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angular5-social-login';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorLayoutComponent } from '../../visitor-layout/visitor-layout.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-visitor-sign-in',
    templateUrl: './visitor-sign-in.component.html',
    styleUrls: ['./visitor-sign-in.component.css']
})
export class VisitorSignInComponent implements OnInit {

    PasswordSettings = {
        displayText: 'Show',
        displayType: 'password'
    };

    returnUrl: string;
    closeAfterSignin = false;
    channelName: string;
    queryParams = {};

    User: LoginUser;

    processing = false;
    processingGoogle = false;
    processingFacebook = false;
    validationErrors: any[] = [];
    fieldErrors: any = {};

    constructor(private title: Title,
                private route: ActivatedRoute,
                private router: Router,
                private actRoute: ActivatedRoute,
                private socialAuthService: SocialAuthService,
                private accountService: VisitorAccountService,
                private validationErrorService: ValidationErrorService,
                private notification: NotificationService,
                private parentComponent: VisitorLayoutComponent,
                private authService: AuthService) {

        // set page title
        this.title.setTitle('Sign In | Quick Waka');
        this.User = new LoginUser();
    }

    ngOnInit() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

        // get logged in user
        if (this.authService.getUser()) {
            this.router.navigate(['/']);
        }

        // get query params if any
        this.actRoute.queryParams.subscribe(params => {
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

    togglePasswordVisibitiy() {
        if (this.PasswordSettings.displayText === 'Show') {
            this.PasswordSettings.displayText = 'Hide';
            this.PasswordSettings.displayType = 'text';
        } else {
            this.PasswordSettings.displayText = 'Show';
            this.PasswordSettings.displayType = 'password';
        }
    }

    signin() {
        this.processing = true;
        this.validationErrors = [];
        this.fieldErrors = {};
        let error = false;

        if (!this.User.username || this.User.username.trim() === '') {
            this.fieldErrors.Username = 'Enter your email address';
            error = true;
        }
        if (!this.User.password || this.User.password.trim() === '') {
            this.fieldErrors.Password = 'Enter your password';
            error = true;
        }

        if (error) {
            this.processing = false;
        } else {
            this.accountService.signIn(this.User).subscribe(
                // success
                () => {
                    this.parentComponent.refreshUserInfo();

                    // do I need to close this tab
                    if (this.closeAfterSignin && this.channelName) {
                        const channel = new BroadcastChannel(this.channelName);
                        channel.postMessage('success');
                        window.close();
                    } else {
                        this.router.navigate([this.returnUrl]);
                    }
                    // this.processing = false;
                },

                // error
                errors => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                    this.validationErrors = allErrors.validationErrors;
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.Username === undefined && this.fieldErrors.Password === undefined) {
                        this.validationErrors.push('Invalid account details');
                    }
                    if (this.fieldErrors.error) {
                        if (this.fieldErrors.error.indexOf('email') !== - 1) {
                            this.fieldErrors.Username = this.fieldErrors.error;
                        } else {
                            this.fieldErrors.GeneralError = this.fieldErrors.error;
                        }
                    }
                    this.processing = false;
                }
            );
        }
    }

    signInWithGoogle(): void {
        this.processingGoogle = true;
        this.socialSignIn(GoogleLoginProvider.PROVIDER_ID);
    }

    signInWithFB(): void {
        this.processingFacebook = true;
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
                            this.parentComponent.refreshUserInfo();
                            // do I need to close this tab
                            if (this.closeAfterSignin && this.channelName) {
                                const channel = new BroadcastChannel(this.channelName);
                                channel.postMessage('success');
                                window.close();
                            } else {
                                this.router.navigate([this.returnUrl]);
                            }
                            this.processingFacebook = false;
                            this.processingGoogle = false;
                        },
                        error => {
                            this.processingFacebook = false;
                            this.processingGoogle = false;
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
