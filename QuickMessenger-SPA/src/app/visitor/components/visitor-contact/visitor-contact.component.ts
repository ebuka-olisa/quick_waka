import { VisitorHomeService } from './../../services/visitor-home.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ContactMessage } from 'src/app/models/message';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
    selector: 'app-visitor-contact',
    templateUrl: './visitor-contact.component.html',
    styleUrls: ['./visitor-contact.component.css']
})
export class VisitorContactComponent implements OnInit {

    Message: ContactMessage;

    processing = false;
    fieldErrors: any = {};

    constructor(private title: Title,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService,
                private homeService: VisitorHomeService) {
        // set page title
        this.title.setTitle('Contact Us | Quick Waka');

        this.Message = new ContactMessage();
    }

    ngOnInit() {
    }

    send() {
        this.processing = true;
        this.fieldErrors = {};
        let error = false;

        if (!this.Message.name || this.Message.name.trim() === '') {
            this.fieldErrors.Name = 'Enter your name';
            error = true;
        }
        if (!this.Message.email || this.Message.email.trim() === '') {
            this.fieldErrors.Email = 'Enter your email address';
            error = true;
        }
        if (!this.Message.message || this.Message.message.trim() === '') {
            this.fieldErrors.Message = 'Enter your message';
            error = true;
        }

        if (error) {
            this.processing = false;
        } else {
            this.homeService.mailQuickWaka(this.Message).subscribe(

                // success
                () => {
                    this.notify.success('Thank you!! We have received your message.');
                    this.processing = false;
                    this.Message = new ContactMessage();
                    // this.router.navigate(['/my-account/address-book']);
                },

                // error
                errors => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error) {
                        if (this.fieldErrors.error.indexOf('email') !== - 1) {
                            this.fieldErrors.Email = this.fieldErrors.error;
                        }
                    }
                    this.processing = false;
                }
            );
        }
    }
}
