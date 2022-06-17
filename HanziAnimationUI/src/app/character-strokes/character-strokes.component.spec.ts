import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStrokesComponent } from './character-strokes.component';

describe('CharacterStrokesComponent', () => {
  let component: CharacterStrokesComponent;
  let fixture: ComponentFixture<CharacterStrokesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterStrokesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterStrokesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
