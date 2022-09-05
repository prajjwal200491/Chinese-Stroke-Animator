import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCharactersComponent } from './group-characters.component';

describe('GroupCharactersComponent', () => {
  let component: GroupCharactersComponent;
  let fixture: ComponentFixture<GroupCharactersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupCharactersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCharactersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
