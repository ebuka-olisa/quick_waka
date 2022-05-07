import { NotificationService } from './../../../../services/notification.service';
import { VisitorMyAccountComponent } from './../visitor-my-account/visitor-my-account.component';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { VisitorNewAddressComponent } from '../../address/visitor-new-address/visitor-new-address.component';
import { DeliveryAddress } from 'src/app/models/address';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';

@Component({
    selector: 'app-visitor-addresses',
    templateUrl: './visitor-addresses.component.html',
    styleUrls: ['./visitor-addresses.component.css']
})
export class VisitorAddressesComponent implements OnInit, OnDestroy {

    Addresses: DeliveryAddress[];

    currentDialog;
    noticeModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(title: Title,
                private userService: VisitorUserService,
                private parentComponent: VisitorMyAccountComponent,
                private modalService: NgbModal,
                private notify: NotificationService) {

        title.setTitle('Address Book | Quick Waka');
    }

    ngOnInit() {
        // load user's addresses
        this.parentComponent.showLoadingIndicator = true;
        return this.userService.getAddresses().subscribe(
            // success
            response => {
                this.Addresses = response;
                this.parentComponent.showLoadingIndicator = false;
            },

            // error
            error => {
                this.notify.error('Problem retrieving address information, please try reloading page');
                this.parentComponent.showLoadingIndicator = false;
            }
        );
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    // DELETE
    deleteAddress(address: DeliveryAddress) {
        if (!address.defaultAdd) {
            // show another modal asking to delete or not
            this.currentDialog = this.modalService.open(ConfirmDeleteComponent, this.noticeModalConfig);
            this.currentDialog.componentInstance.ModalContent = {
                item: 'Address',
                source: 'Visitor'
            };
            this.currentDialog.componentInstance.completeDelete.subscribe(
                () => {
                    this.completeDelete(address);
                }
            );
        } else {
            // tell user that this item cannot be removed
            this.currentDialog = this.modalService.open(ShowInfoComponent, this.noticeModalConfig);
            this.currentDialog.componentInstance.ModalContent = {
                title: 'Default Delivery Address',
                message: 'This address cannot be deleted because it is being used as the default delivery address.',
                icon: 'warning',
                source: 'Visitor'
            };
        }
    }

    completeDelete(address: DeliveryAddress) {
        this.parentComponent.showFullTransparentLoadingIndicator = true;

        this.userService.deleteAddress(address)
        .subscribe(

            // success
            (response) => {

                // remove deleted address
                let addressIndex = 0;
                for (const add of this.Addresses) {
                    if (add.id === address.id) {
                        break;
                    } else {
                        addressIndex++;
                    }
                }
                this.Addresses.splice(addressIndex, 1);

                // remove modal
                this.currentDialog.close();

                // hide loading indicator
                this.parentComponent.showFullTransparentLoadingIndicator = false;

                // show success message
                this.notify.success('Address was deleted successfully!');
            },

            // error
            error => {
                // hide loading indicator
                this.parentComponent.showFullTransparentLoadingIndicator = false;
            }
        );
    }
}
