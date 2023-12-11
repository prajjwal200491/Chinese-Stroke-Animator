import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalService } from 'src/app/modal.service';
import { loadWordsListData, reschuffleList } from 'src/app/state/app.actions';
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
    private readonly ms: ModalService) { 
  }

  ngOnInit(): void {
    this.customList$ = this.store.select(selectCustomListData);
    this.store.dispatch(loadWordsListData());
  }

  onListSearch():void{
      this.customList$=this.customList$.pipe(
        map(list=> list.filter(item=> item.cardname.includes(this.listName)))
      )
  }

  goBack(){
    this.location.back();
  }

  reschuffleList(list:List){
    this.store.dispatch(reschuffleList({list:list}));
  }

  onListBtnClick(){
    this.ms.openModal();
  }


}
