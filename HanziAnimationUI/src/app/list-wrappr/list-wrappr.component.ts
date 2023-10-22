import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { selectListDataWithCards } from '../state/app.selector';

@Component({
  selector: 'app-list-wrappr',
  templateUrl: './list-wrappr.component.html',
  styleUrls: ['./list-wrappr.component.scss']
})
export class ListWrapprComponent implements OnInit {
  listData: any;
  listValues: any;
  listKeys: any;

  constructor(private readonly store: Store<AppState>) {
    this.store.select(selectListDataWithCards).subscribe(res=>{
      if(res){
        this.listData=res;
        this.listValues = Object.values(this.listData);
        this.listKeys = Object.keys(this.listData);
      }
      
    })
   }

  ngOnInit(): void {
  }

}
