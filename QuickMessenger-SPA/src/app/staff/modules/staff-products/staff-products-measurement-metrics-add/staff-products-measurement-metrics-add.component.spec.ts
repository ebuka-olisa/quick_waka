/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffProductsMeasurementMetricsAddComponent } from './staff-products-measurement-metrics-add.component';

describe('StaffProductsMeasurementMetricsAddComponent', () => {
  let component: StaffProductsMeasurementMetricsAddComponent;
  let fixture: ComponentFixture<StaffProductsMeasurementMetricsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffProductsMeasurementMetricsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffProductsMeasurementMetricsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
