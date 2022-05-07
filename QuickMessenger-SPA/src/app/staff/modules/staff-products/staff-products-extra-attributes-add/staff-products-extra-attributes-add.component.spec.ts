/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffProductsExtraAttributesAddComponent } from './staff-products-extra-attributes-add.component';

describe('StaffProductsExtraAttributesAddComponent', () => {
  let component: StaffProductsExtraAttributesAddComponent;
  let fixture: ComponentFixture<StaffProductsExtraAttributesAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffProductsExtraAttributesAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffProductsExtraAttributesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
