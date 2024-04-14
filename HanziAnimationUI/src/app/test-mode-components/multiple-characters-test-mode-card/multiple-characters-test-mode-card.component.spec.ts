import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleCharactersTestModeCardComponent } from './multiple-characters-test-mode-card.component';

describe('MultipleCharactersTestModeCardComponent', () => {
  let component: MultipleCharactersTestModeCardComponent;
  let fixture: ComponentFixture<MultipleCharactersTestModeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleCharactersTestModeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleCharactersTestModeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
