import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { CharacterList } from '../test-mode-list/test-mode-list.component';
import { loadRelatedWords, updateCharacter } from 'src/app/state/app.actions';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class DisplayCardComponent implements OnInit, OnChanges {
@Input() character!:CharacterList;
@Input() index!:number;
@Input() revealPinyins:boolean=false;
@Output() onTestModeCharacterClick = new EventEmitter();
isTick=false;
pinyins:string[]=[];
  constructor(private readonly store:Store, private readonly http: HttpClient) { }

  ngOnInit(): void {

    
  }

  ngOnChanges(changes: SimpleChanges):void{
    console.log(this.revealPinyins);
    if(changes?.character?.currentValue){
      this.revealPinyins = false;
      this.isTick = this.character.characterValues.every(item=> item.isTicked);
      changes.character.currentValue.characterValues.forEach((c:any)=>{
        this.getPinyin(c.value);
      })
    }
  }

  onCharacterClick(character:string){
    this.store.dispatch(updateCharacter({ character: character }))
    this.store.dispatch(loadRelatedWords({}));
    this.onTestModeCharacterClick.emit(character);
  }

  speak(character: string): void {
    const utterance = new SpeechSynthesisUtterance(character);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
  }

  getPinyin(character:string){
    this.http.get('assets/dictionary.json').subscribe((res:any)=>{
      let d = res.dictionary.find((d: any) => d.character === character);
      this.pinyins = [...this.pinyins, d.pinyin[0]];
    })
  }

}
