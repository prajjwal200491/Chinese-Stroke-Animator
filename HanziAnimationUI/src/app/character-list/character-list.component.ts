import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { reschuffleList } from '../state/app.actions';
import { List } from '../state/app.model';
import { selectCustomListData, selectFourCustomListData } from '../state/app.selector';
import { AppState } from '../state/app.state';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit {
customList$!: Observable<List[]>;
modalHeader: string = 'Create';

  constructor(private readonly store: Store<AppState>) { }

  ngOnInit(): void {
    this.customList$ = this.store.select(selectFourCustomListData);
  }

  reschuffleList(list:List){
    this.store.dispatch(reschuffleList({list:list}));
  }

}
