import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { Observable, of } from 'rxjs';
import { CharacterService } from '../character.service';
import { loadCharacter, searchCharacter, updateCharacter } from '../state/app.actions';
import { selectLatestCharacter, selectRecentlyTypedCharacters } from '../state/app.selector';
import { AppState } from '../state/app.state';
declare const Slider: any;

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  writer!: HanziWriter;
  slider: any;
  strokeSpeed!: number;
  isPaused: boolean = true;
  playing: boolean = false;
  chineseTxt:string='開';
  recentlyTyped$!: Observable<string[]>;
  latestCharacter!:string;
  constructor(private readonly store: Store<AppState>, private readonly characterService: CharacterService) {
   }

  ngOnInit(): void {
    this.strokeSpeed = 0.25;
    this.slider = new Slider('#slider-speed');
    this.slider.on("change", (sliderValue: any) => {
      this.strokeSpeed = sliderValue.newValue*0.25;
    })
    this.recentlyTyped$ = this.store.select(selectRecentlyTypedCharacters);
    this.store.select(selectLatestCharacter).subscribe(c=> this.latestCharacter=c);
  }
  textChange(e: any){
    this.store.dispatch(searchCharacter({search: e}));
  }
  onClick(character: string){
    this.characterService.destroyCharacter();
    this.store.dispatch(updateCharacter({character: character}))
  }

}
