import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CharacterService } from '../character.service';
import { loadWordsList, reschuffleList, setActiveCharacterList } from '../state/app.actions';
import { List } from '../state/app.model';
import { selectCustomListData, selectFourCustomListData, selectListDataWithCards } from '../state/app.selector';
import { AppState } from '../state/app.state';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit, OnChanges {
customList$!: Observable<List[]>;
modalHeader: string = 'Create';
@ViewChild('list') list!: HTMLElement;
@Input() listname!: string; 
@Input() isTestMode=false; 
selectedList: any;
selectedListValues:any;
selectedCharacterCardName!:string;

  constructor(private readonly store: Store<AppState>, private readonly cs: CharacterService) { }

  ngOnInit(): void {
    this.customList$ = this.store.select(selectFourCustomListData);
  }
  ngOnChanges():void{
    this.store.select(selectListDataWithCards).subscribe(res=>{
      if(res && this.listname){
        const values = Object.values(res);
        this.selectedList=values.filter(list=>{
          return list.listname === this.listname
        });
        this.selectedListValues=Object.values(this.selectedList[0].values)
      }
    })
  }

  reschuffleList(list:List){
    //this.list.scroll(0,0)
    //window.scroll(0,0);
    this.store.dispatch(reschuffleList({list:list}));
  }

  handleTestModeCharacterClick(character:string){
    this.selectedListValues.forEach((values:any)=>{
      const match =values.characters.find((ch:any)=> ch.value===character);
      if(match){
        this.selectedCharacterCardName = values.cardname;
      }
    })
    this.store.dispatch(setActiveCharacterList({character:{active: true, value: character}, listName: this.listname, cardName: this.selectedCharacterCardName}));
  }

}
