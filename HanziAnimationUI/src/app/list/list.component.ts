import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ListData } from '../state/app.model';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { selectListDataWithCards } from '../state/app.selector';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnChanges {
  
@Input() list:any;
@Input() nameWithoutSpaces:any;
@Input() nameWithSpaces:any;
listValues:any;
  constructor(private readonly store: Store<AppState>) {
    
   }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.list){
this.listValues = Object.values(this.list.values)
    }
  }

  ngOnInit(): void {
   
    
  }
  addCard(){}

}
