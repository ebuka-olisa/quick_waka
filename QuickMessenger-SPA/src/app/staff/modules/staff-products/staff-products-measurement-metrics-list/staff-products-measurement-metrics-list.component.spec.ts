/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffProductsMeasurementMetricsListComponent } from './staff-products-measurement-metrics-list.component';

describe('StaffProductsMeasurementMetricsListComponent', () => {
  let component: StaffProductsMeasurementMetricsListComponent;
  let fixture: ComponentFixture<StaffProductsMeasurementMetricsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffProductsMeasurementMetricsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffProductsMeasurementMetricsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
