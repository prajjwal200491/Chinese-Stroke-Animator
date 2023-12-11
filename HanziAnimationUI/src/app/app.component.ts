import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadWordsList } from './state/app.actions';
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
    const data = {
      'listName': 'TwoC',
      'listId': 22,
      'cardName': 'SectionB',
      'cardId':35,
      'characters':[
        {
          'characterName': '今天',
          'active': false,
          'characterValue': '今天'
        },
        {
          'characterName': '再見',
          'active': false,
          'characterValue': '再見'
        },
      ]
    };
    // this.httpClient.put('http://localhost:3000/api/lists/updateWithListCardsAndCharacters',data).subscribe(res=>{
    //   debugger;
    //   console.log(res);
    // })
  }

  

}
