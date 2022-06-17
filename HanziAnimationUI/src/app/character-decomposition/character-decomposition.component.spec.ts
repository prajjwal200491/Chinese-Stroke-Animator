import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterDecompositionComponent } from './character-decomposition.component';

describe('CharacterDecompositionComponent', () => {
  let component: CharacterDecompositionComponent;
  let fixture: ComponentFixture<CharacterDecompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterDecompositionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterDecompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
