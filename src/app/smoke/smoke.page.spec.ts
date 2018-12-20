import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmokePage } from './smoke.page';

describe('SmokePage', () => {
  let component: SmokePage;
  let fixture: ComponentFixture<SmokePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmokePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmokePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
