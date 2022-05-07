import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }

  error(message: string, title?: string) {
    this.toastr.error(message, title);
  }

  success(message: string, title?: string) {
    this.toastr.success(message, title);
  }

  info(message: string, title?: string) {
    this.toastr.info(message, title);
  }

  clearAll() {
    this.toastr.clear();
  }
}
