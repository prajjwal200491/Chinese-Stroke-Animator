import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CharacterService } from 'src/app/character.service';
import { Character } from 'src/app/state/app.model';
import { selectChineseCharactersList } from 'src/app/state/app.selector';
import { ChineseCharacter } from 'src/app/state/app.state';

export interface CharacterList{
  name:string;
  active:boolean;
  characterValues:{value:string; isTicked:boolean;}[]
}

@Component({
  selector: 'app-test-mode-list',
  templateUrl: './test-mode-list.component.html',
  styleUrls: ['./test-mode-list.component.scss']
})
export class TestModeListComponent implements OnInit, OnChanges {
  @Input() cards: any;
  @Output() onTestModeCharacterClick = new EventEmitter();
  characters: Character[] = [];
  characterList: CharacterList[]=[];
  chineseCharacterList!:ChineseCharacter[];

  constructor(private readonly characterService: CharacterService, private readonly store:Store) { }

  ngOnInit(): void {
    this.store.select(selectChineseCharactersList).subscribe(list=>{
      if(list.length>0){
        this.chineseCharacterList = list;
        this.characterList =this.characterList.map(characters=>{
          return {
            ...characters,
            characterValues: characters.characterValues.map(item=>{
              const match =list.find(l=>{
                return l.value===item.value
              });
              if(match!==undefined){
                return {
                  ...item,
                  isTicked: match.isTicked as boolean
                }
              }
              return item
            })
          }
        })
      }
    })
    
  }

  ngOnChanges(changes: SimpleChanges):void{
    if(!changes.cards.firstChange){
      this.characterList=[];
    }
    if(changes.cards?.currentValue.length>0){
      this.cards.forEach((card:any)=>{
        card.characters.forEach((character:any)=>{
          const values = character.value.split('');
          const list={
            name: character.value,
            active:character.active,
            characterValues: values.map((item:any)=>{
              return {
                value: item,
                isTicked: this.chineseCharacterList?.length>0 && this.chineseCharacterList.find(i=> i.value===item)?.isTicked
              }
            })
          }
          this.characterList=[...this.characterList, list]
        })
      })
    }
  }

  speak(character: string): void {
    const utterance = new SpeechSynthesisUtterance(character);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
  }

}
