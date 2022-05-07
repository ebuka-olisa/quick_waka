/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffProductsExtraAttributesSelectComponent } from './staff-products-extra-attributes-select.component';

describe('StaffProductsExtraAttributesSelectComponent', () => {
  let component: StaffProductsExtraAttributesSelectComponent;
  let fixture: ComponentFixture<StaffProductsExtraAttributesSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffProductsExtraAttributesSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffProductsExtraAttributesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
