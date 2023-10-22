import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWrapprComponent } from './list-wrappr.component';

describe('ListWrapprComponent', () => {
  let component: ListWrapprComponent;
  let fixture: ComponentFixture<ListWrapprComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListWrapprComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWrapprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
