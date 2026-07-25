import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalService } from 'src/app/modal.service';
import { loadWordsList, reschuffleList } from 'src/app/state/app.actions';
import { List, ListData } from 'src/app/state/app.model';
import { selectCustomListData, selectListDataWithCards } from 'src/app/state/app.selector';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-content-list-view',
  templateUrl: './content-list-view.component.html',
  styleUrls: ['./content-list-view.component.scss']
})
export class ContentListViewComponent implements OnInit {
  customList$!: Observable<List[]>;
  modalHeader: string = 'Create';
  listName: string='';
  openModal=false;

  constructor(private readonly store: Store<AppState>, private readonly location: Location, 
    private readonly ms: ModalService, private readonly router:Router) { 
  }

  ngOnInit(): void {
    this.customList$ = this.store.select(selectCustomListData);
    // Fetch list data via SPA navigation. Must dispatch loadWordsList (the action
    // the effect listens for) — loadWordsListData has no effect and is a no-op, so
    // after the window.location.reload() was removed the lists page loaded empty.
    this.store.dispatch(loadWordsList());
  }

  onListSearch():void{
      this.customList$=this.customList$.pipe(
        map(list=> list.filter(item=> item.cardname.includes(this.listName)))
      )
  }

  goBack(){
    // SPA navigation only — the previous window.location.reload() forced a full
    // page reload and re-fired all startup API calls.
    this.router.navigate(['']);
  }

  reschuffleList(list:List){
    this.store.dispatch(reschuffleList({list:list}));
  }

  onListBtnClick(){
    this.ms.openModal();
  }


}
