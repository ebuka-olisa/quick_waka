import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm-delete',
    templateUrl: './confirm-delete.component.html',
    styleUrls: ['./confirm-delete.component.css']
})
export class ConfirmDeleteComponent implements OnInit {

    @Output() completeDelete = new EventEmitter<any>();
    @Input() ModalContent: any;

    Item: string;
    ExtraMessage: string;
    Action: string;
    Visitor = false;

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
            this.Action = 'Delete';
        }

        if (this.ModalContent.source && this.ModalContent.source === 'Visitor') {
            this.Visitor = true;
        }
    }

    delete() {
        this.completeDelete.emit();
    }

    dismiss() {
        this.activeModal.dismiss();
    }

}
