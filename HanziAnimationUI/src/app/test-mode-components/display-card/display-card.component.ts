import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { CharacterList } from '../test-mode-list/test-mode-list.component';
import { loadRelatedWords, updateCharacter } from 'src/app/state/app.actions';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class DisplayCardComponent implements OnInit, OnChanges {
@Input() character!:CharacterList;
@Input() index!:number;
@Output() onTestModeCharacterClick = new EventEmitter();
isTick=false;
  constructor(private readonly store:Store) { }

  ngOnInit(): void {

    
    
  }

  ngOnChanges(changes: SimpleChanges):void{
    if(changes.character.currentValue){
      this.isTick = this.character.characterValues.every(item=> item.isTicked);
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

}
