import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleCharactersCopyModeCardComponent } from './multiple-characters-copy-mode-card.component';

describe('MultipleCharactersCopyModeCardComponent', () => {
  let component: MultipleCharactersCopyModeCardComponent;
  let fixture: ComponentFixture<MultipleCharactersCopyModeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleCharactersCopyModeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleCharactersCopyModeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
