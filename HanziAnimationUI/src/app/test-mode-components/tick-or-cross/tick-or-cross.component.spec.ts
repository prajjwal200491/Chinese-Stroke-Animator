import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickOrCrossComponent } from './tick-or-cross.component';

describe('TickOrCrossComponent', () => {
  let component: TickOrCrossComponent;
  let fixture: ComponentFixture<TickOrCrossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TickOrCrossComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TickOrCrossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
