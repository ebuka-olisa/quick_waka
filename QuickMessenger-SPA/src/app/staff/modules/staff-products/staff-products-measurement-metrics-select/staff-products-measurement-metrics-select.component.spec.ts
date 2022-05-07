/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffProductsMeasurementMetricsSelectComponent } from './staff-products-measurement-metrics-select.component';

describe('StaffProductsMeasurementMetricsSelectComponent', () => {
  let component: StaffProductsMeasurementMetricsSelectComponent;
  let fixture: ComponentFixture<StaffProductsMeasurementMetricsSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffProductsMeasurementMetricsSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffProductsMeasurementMetricsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
