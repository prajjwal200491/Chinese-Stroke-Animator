import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyModeComponent } from './copy-mode.component';

describe('CopyModeComponent', () => {
  let component: CopyModeComponent;
  let fixture: ComponentFixture<CopyModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
