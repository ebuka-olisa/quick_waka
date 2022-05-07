import { DeliveryAddress } from 'src/app/models/address';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { VisitorNewAddressComponent } from '../visitor-new-address/visitor-new-address.component';
import { NotificationService } from 'src/app/services/notification.service';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';

@Component({
    selector: 'app-visitor-address-book',
    templateUrl: './visitor-address-book.component.html',
    styleUrls: ['./visitor-address-book.component.css']
})
export class VisitorAddressBookComponent implements OnInit, OnDestroy {

    @Input() initialState: any;
    @Output() addressSelected = new EventEmitter<any>();
    // @Output() addressDeleted = new EventEmitter<any>();
    @Output() selectedAddressUpdated = new EventEmitter<any>();

    Addresses: DeliveryAddress[];

    InitialSelectedAddressId: string;
    SelectedAddressId: string;
    deleting = false;
    PickupAddresses = false;

    currentDialog;
    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };
    noticeModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private userService: VisitorUserService,
                private notify: NotificationService) { }

    ngOnInit() {
        this.Addresses = [];

        if (this.initialState) {
            if (this.initialState.Addresses) {
                this.Addresses = this.initialState.Addresses;
            }
            if (this.initialState.SelectedAddressId) {
                this.InitialSelectedAddressId = this.initialState.SelectedAddressId + '';
                this.SelectedAddressId = this.initialState.SelectedAddressId + '';
            }
            if (this.initialState.pickup) {
                this.PickupAddresses = this.initialState.pickup;
            }
        }
    }

    ngOnDestroy() {
        if (this.currentDialog) {
            this.currentDialog.close();
        }
    }

    close() {
        this.activeModal.dismiss();
    }

    newAddress() {
        const initialState = {
            Pickup: this.PickupAddresses,
            FirstAddress: !this.Addresses || this.Addresses.length === 0
        };

        this.currentDialog = this.modalService.open(VisitorNewAddressComponent, this.modalConfig);
        this.currentDialog.componentInstance.initialState = initialState;
        this.currentDialog.componentInstance.addressCreated.subscribe(
            () => {
                // reload list of addresses
                return this.userService.getAddresses().subscribe(
                    // success
                    response => {
                        this.Addresses = response;

                        // close modal
                        this.currentDialog.close();
                        this.notify.success('Address was created successfully!');
                    },

                    // error
                    error => {}
                );
            }
        );
    }

    editAddress(address: DeliveryAddress) {
        const initialState = {
            SelectedAddress: address,
            Pickup: this.PickupAddresses
        };

        this.currentDialog = this.modalService.open(VisitorNewAddressComponent, this.modalConfig);
        this.currentDialog.componentInstance.initialState = initialState;
        this.currentDialog.componentInstance.addressUpdated.subscribe(
            (updatedAddress: DeliveryAddress) => {
                // find address index
                let addressIndex = 0;
                for (let i = 0; i < this.Addresses.length; i++) {
                    const add  = this.Addresses[i];
                    if (add.id === address.id) {
                        addressIndex = i;
                    } else if (updatedAddress.defaultAdd) {
                        add.defaultAdd = false;
                    }
                }

                updatedAddress.id = address.id;
                this.Addresses[addressIndex] = updatedAddress;

                // close modal
                this.currentDialog.close();

                // success message
                this.notify.success('Address was updated successfully!');

                // if address is selected address alert parent component
                if (this.InitialSelectedAddressId && this.InitialSelectedAddressId === (address.id + '')) {
                    this.selectedAddressUpdated.emit(this.Addresses[addressIndex]);
                }
            }
        );
    }

    /*deleteAddress(address: DeliveryAddress) {
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
    }*/

    /*completeDelete(address: DeliveryAddress) {
        this.deleting = true;

        this.userService.deleteAddress(address)
        .subscribe(

            // success
            (response) => {
                this.deleting = false;

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

                // show success message
                this.notify.success('Address was deleted successfully!');

                // if selected address was deleted, make changes
                if (this.SelectedAddressId === address.id + '') {
                    this.SelectedAddressId = null;
                }
                if (this.InitialSelectedAddressId === address.id + '') {
                    this.addressDeleted.emit();
                }
            },

            // error
            error => {}
        );
    }*/

    selectAddress() {
        let address: DeliveryAddress;
        for (const add of this.Addresses) {
            if ((add.id + '') === this.SelectedAddressId) {
                address = add;
                break;
            }
        }
        this.addressSelected.emit(address);
    }
}
