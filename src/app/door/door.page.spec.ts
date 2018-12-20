import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorPage } from './door.page';

describe('DoorPage', () => {
  let component: DoorPage;
  let fixture: ComponentFixture<DoorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
