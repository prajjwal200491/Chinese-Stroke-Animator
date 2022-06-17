import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBackgroundComponent } from './custom-background.component';

describe('CustomBackgroundComponent', () => {
  let component: CustomBackgroundComponent;
  let fixture: ComponentFixture<CustomBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomBackgroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
