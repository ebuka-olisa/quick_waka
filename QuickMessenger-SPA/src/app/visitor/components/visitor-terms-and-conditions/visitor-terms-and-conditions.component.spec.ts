import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorTermsAndConditionsComponent } from './visitor-terms-and-conditions.component';

describe('VisitorTermsAndConditionsComponent', () => {
  let component: VisitorTermsAndConditionsComponent;
  let fixture: ComponentFixture<VisitorTermsAndConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitorTermsAndConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitorTermsAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
