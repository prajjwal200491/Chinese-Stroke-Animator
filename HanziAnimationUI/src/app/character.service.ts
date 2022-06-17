import { Injectable } from '@angular/core';
import HanziWriter from 'hanzi-writer';
import { Character, CharacterProperties, List } from './state/app.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private writer!: HanziWriter

  constructor() { }

  loadCharacter(id: string, text: string, properties: CharacterProperties): any{
    this.writer = HanziWriter.create(id, text, properties);
    return this.writer;
  }

  destroyCharacter(){
    this.writer._hanziWriterRenderer?.destroy();
  }

  updateCharacter(character: string){
    this.writer.setCharacter(character);
  }

  startAnimation(){
    this.writer.animateCharacter();
  }
  resumeAnimation(){
    this.writer.resumeAnimation();
  }
  pauseAnimation(){
    this.writer.pauseAnimation();
  }
  changeAnimationSpeed(speed: number){
    this.writer._options.strokeAnimationSpeed= speed
  }

  
  
}
