import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadRelatedWords, setActiveCharacterList, updateCharacter, updateList } from 'src/app/state/app.actions';
import { Character, List } from 'src/app/state/app.model';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-custom-list',
  templateUrl: './custom-list.component.html',
  styleUrls: ['./custom-list.component.scss']
})
export class CustomListComponent implements OnInit {
  modalHeader: string = 'Update';
  @Input() list!: List;
  @Output() moveList = new EventEmitter();

  constructor(private readonly store: Store<AppState>, private router: Router) { }

  ngOnInit(): void {
  }

  onClick(character: Character): void {
    if (this.router.url === '/lists') {
      this.router.navigate(['/']);
    }
    this.moveList.emit(this.list);
    this.store.dispatch(updateCharacter({ character: character.value }))
    this.store.dispatch(setActiveCharacterList({character:{active: true, value: character.value}, listName: this.list.name}));
    this.store.dispatch(loadRelatedWords());
  }

  onListClick(list: List) {
    if (this.router.url === '/lists') {
      this.router.navigate(['/']);
    }
    this.moveList.emit(list);
  }


}
