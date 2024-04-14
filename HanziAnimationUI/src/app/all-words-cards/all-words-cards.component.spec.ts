import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllWordsCardsComponent } from './all-words-cards.component';

describe('AllWordsCardsComponent', () => {
  let component: AllWordsCardsComponent;
  let fixture: ComponentFixture<AllWordsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllWordsCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllWordsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
