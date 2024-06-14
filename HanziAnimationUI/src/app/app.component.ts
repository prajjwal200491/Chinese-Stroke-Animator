import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getChineseCharacterTickValue, loadWordsList } from './state/app.actions';
import { AppState } from './state/app.state';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private readonly store: Store<AppState>, private readonly httpClient:HttpClient) {}

  ngOnInit(){
    this.store.dispatch(loadWordsList());    
    this.store.dispatch(getChineseCharacterTickValue());    
  }

  


}
