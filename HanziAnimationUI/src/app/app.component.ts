import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadWordsList } from './state/app.actions';
import { AppState } from './state/app.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(){
    this.store.dispatch(loadWordsList());    
  }

  

}
