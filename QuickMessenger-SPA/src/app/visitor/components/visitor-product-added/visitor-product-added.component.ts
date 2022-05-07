import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-visitor-product-added',
  templateUrl: './visitor-product-added.component.html',
  styleUrls: ['./visitor-product-added.component.css']
})
export class VisitorProductAddedComponent implements OnInit {

    @Input() initialState: any;
    @Output() closed = new EventEmitter<any>();
    FromOrder = false;

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() {
      if (this.initialState && this.initialState.OrderAdded) {
          this.FromOrder = true;
      }
    }

    close() {
        this.activeModal.dismiss();
        this.closed.emit();
    }

}
