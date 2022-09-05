import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { Observable, of } from 'rxjs';
import { CharacterService } from '../character.service';
import { loadCharacter, loadWordsList, searchCharacter, updateCharacter } from '../state/app.actions';
import { selectLatestCharacter, selectRecentlyTypedCharacters } from '../state/app.selector';
import { AppState } from '../state/app.state';

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
  chineseTxt:string='開';
  recentlyTyped$!: Observable<string[]>;
  latestCharacter!:string;
  groupCharacters!:string[];
  constructor(private readonly store: Store<AppState>, private readonly characterService: CharacterService) {
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
  }
  textChange(e: any){
    this.store.dispatch(searchCharacter({search: e}));
  }
  onClick(character: string){
    this.characterService.destroyCharacter(this.writer);
    this.store.dispatch(updateCharacter({character: character}))
  }


}
