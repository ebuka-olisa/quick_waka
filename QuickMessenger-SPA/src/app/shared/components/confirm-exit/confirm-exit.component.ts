import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-exit',
  templateUrl: './confirm-exit.component.html',
  styleUrls: ['./confirm-exit.component.css']
})
export class ConfirmExitComponent implements OnInit {

  @Output() closeEditModal = new EventEmitter<any>();

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  close() {
    this.activeModal.dismiss();
    // this.sharedService.navigateAwaySelection$.next(false);
  }

  discardChanges() {
    this.closeEditModal.emit();
    // this.sharedService.navigateAwaySelection$.next(true);
  }
}
