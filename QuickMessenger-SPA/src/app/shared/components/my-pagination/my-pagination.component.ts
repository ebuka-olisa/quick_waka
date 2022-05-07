import { Pagination } from './../../../models/pagination';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-pagination',
  templateUrl: './my-pagination.component.html',
  styleUrls: ['./my-pagination.component.css']
})
export class MyPaginationComponent implements OnInit {

  @Input() pagination: Pagination;
  @Output() pageChanged = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  emitPageChanged(newPageNumber: number) {
    this.pageChanged.emit(newPageNumber);
  }

}
