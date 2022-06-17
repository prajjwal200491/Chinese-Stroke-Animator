import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { reschuffleList } from 'src/app/state/app.actions';
import { List } from 'src/app/state/app.model';
import { selectCustomListData } from 'src/app/state/app.selector';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-content-list-view',
  templateUrl: './content-list-view.component.html',
  styleUrls: ['./content-list-view.component.scss']
})
export class ContentListViewComponent implements OnInit {
  customList$!: Observable<List[]>;
  modalHeader: string = 'Create';

  constructor(private readonly store: Store<AppState>, private readonly location: Location) { }

  ngOnInit(): void {
    this.customList$ = this.store.select(selectCustomListData);
  }

  goBack(){
    this.location.back();
  }

  reschuffleList(list:List){
    this.store.dispatch(reschuffleList({list:list}));
  }


}
