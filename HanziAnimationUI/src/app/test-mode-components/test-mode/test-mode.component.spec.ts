import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModeComponent } from './test-mode.component';

describe('TestModeComponent', () => {
  let component: TestModeComponent;
  let fixture: ComponentFixture<TestModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
