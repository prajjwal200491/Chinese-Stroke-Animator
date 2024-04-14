import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { Observable, of } from 'rxjs';
import { CharacterService } from '../character.service';
import { loadCharacter, loadWordsList, loadWordsListData, searchCharacter, setAllListsInactiveOnSearch, updateCharacter } from '../state/app.actions';
import { selectLatestCharacter, selectListDataWithCards, selectRecentlyTypedCharacters } from '../state/app.selector';
import { AppState } from '../state/app.state';
import { ListData } from '../state/app.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  writer!: HanziWriter;
  slider: any;
  isPaused: boolean = true;
  playing: boolean = false;
  chineseTxt:string='';
  recentlyTyped$!: Observable<string[]>;
  latestCharacter!:string;
  groupCharacters!:string[];
  listData!: any;
  modalHeader: string = 'Create';
  listname!: string;
  selected:any;
  nameWithSpaces:any;
  displayName:any='Lists';
  isCopyMode=false;
  isTestMode=false;
  constructor(private readonly store: Store<AppState>, private readonly characterService: CharacterService, private readonly router:Router) {
   }

  ngOnInit(): void {
    //this.characterService.test().subscribe((res)=> console.log(res));
    this.recentlyTyped$ = this.store.select(selectRecentlyTypedCharacters);
    this.store.select(selectLatestCharacter).subscribe(c=> {
      if(c.length>1){
        this.latestCharacter='';
        this.groupCharacters=c.split('');
      }
      else{
        this.groupCharacters=[];
      this.latestCharacter=c;
      }
    });
    this.characterService.getHanziWriter().subscribe(w=> this.writer=w);
    this.store.select(selectListDataWithCards).subscribe(res=>{
      if(res){
        //this.characterService.saveListChanges(res);
        // this.store.dispatch(loadWordsListData());
        this.listData = Object.values(res);
        const index=this.listData.findIndex((item:any)=> item.isSelectedList);
        const indexItem=this.listData.find((item:any,i:number)=>i===index);
        const activeCharacter = this.getActiveCharacter(indexItem);
        if(activeCharacter){
          let c = activeCharacter.value;
          if(c.length>1){
            this.latestCharacter='';
            this.groupCharacters=c.split('');
          }
          else{
            this.groupCharacters=[];
          this.latestCharacter=c;
          }
        }
        this.nameWithSpaces = indexItem.listname;
        this.displayName = this.nameWithSpaces;
        this.listname=indexItem.listname;
        this.selected=indexItem.listname;
        this.listData.splice(index,1);
        this.listData.unshift(indexItem);
        //this.selected = indexItem.name;
        //this.onItemClick(indexItem.name);
        //this.listname = indexItem.name;
      }
    })
  }
  textChange(){
    this.store.dispatch(setAllListsInactiveOnSearch());
    this.store.dispatch(searchCharacter({search: this.chineseTxt}));
    this.onSearchDisabled();
  }
  onClick(character: string){
    this.characterService.destroyCharacter(this.writer);
    this.store.dispatch(updateCharacter({character: character}))
  }

  navigateToMoreList():void{
    this.router.navigate(['/lists']).then(() => {
      window.location.reload();
    });
  }

  onSearchDisabled(){
    const pattern = /^[a-zA-Z\s]+$/;
    return pattern.test(this.chineseTxt);
  }

  onItemClick(list: any){
    this.selected = list.listname;
    this.listname = list.listname;
    this.nameWithSpaces = list.listname;
    this.displayName = this.nameWithSpaces;
  }
  onHandleOnWordCardClick(word:any){
    this.listname = word.listname;
    this.nameWithSpaces = word.listName;
  }

  isActive(item: any){
    return this.selected === item
  }

  getActiveCharacter(item:any):any{
    let values = item.values;
    let activeCharacter;
    for(let o in values){
      let characters = values[o].characters;
      activeCharacter = characters.find((c:any)=> c.active);
      if(activeCharacter){
        return activeCharacter;
      }
    }
    return activeCharacter
  }

  toggleCopyMode():void{
    this.isCopyMode=!this.isCopyMode;
    this.isTestMode = this.isTestMode? !this.isTestMode: this.isTestMode
  }
  toggleTestMode():void{
    this.isTestMode=!this.isTestMode;
    this.isCopyMode = this.isCopyMode? !this.isCopyMode: this.isCopyMode
  }


}
