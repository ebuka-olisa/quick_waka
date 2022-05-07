import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-staff-login-layout',
  templateUrl: './staff-login-layout.component.html',
  styleUrls: ['./staff-login-layout.component.css']
})
export class StaffLoginLayoutComponent implements OnInit, OnDestroy {

  constructor(private renderer: Renderer2) {
    // add css class to body
    this.renderer.addClass(document.body, 'staff-layout');
   }

  ngOnInit() {
  }

  ngOnDestroy() {
      // remove css from body
      this.renderer.removeClass(document.body, 'staff-layout');
  }

}
