import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm-action',
    templateUrl: './confirm-action.component.html',
    styleUrls: ['./confirm-action.component.css']
})
export class ConfirmActionComponent implements OnInit {

    @Output() completeAction = new EventEmitter<any>();
    @Input() ModalContent: any;

    Item: string;
    ExtraMessage: string;
    Action: string;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() {
        if (this.ModalContent.item) {
            this.Item = this.ModalContent.item;
        }

        if (this.ModalContent.extraMessage) {
            this.ExtraMessage = this.ModalContent.extraMessage;
        }

        if (this.ModalContent.action) {
            this.Action = this.ModalContent.action;
        } else {
            this.Action = 'Ok';
        }
    }

    ok() {
        this.completeAction.emit();
    }

    dismiss() {
        this.activeModal.dismiss();
    }

}
