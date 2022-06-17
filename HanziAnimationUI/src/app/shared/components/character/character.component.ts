import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { CharacterService } from 'src/app/character.service';
import { loadCharacter, updateCharacter } from 'src/app/state/app.actions';
import { AppState } from 'src/app/state/app.state';
@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnInit, OnChanges {
  playing:boolean=false;
  @Input() strokeSpeed!:number;
  @Input() chineseTxt!:string;
  background: string= 'character-target-div';

  constructor(private readonly store$: Store<AppState>, private readonly characterService: CharacterService) { }

  ngOnInit(): void {
    this.createHanziAnimation();
  }
  ngOnChanges(sc: SimpleChanges):void{
    if(sc.chineseTxt && sc.chineseTxt.currentValue!==sc.chineseTxt.previousValue && this.chineseTxt!==''){
      this.store$.dispatch(updateCharacter({character: this.chineseTxt}));
    }
    if(sc.strokeSpeed && sc.strokeSpeed.currentValue!==sc.strokeSpeed.previousValue){
      this.characterService.changeAnimationSpeed(this.strokeSpeed);
    }
  }

  private createHanziAnimation(){
    let properties = {
      width: 300,
      height: 300,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: this.strokeSpeed,
      delayBetweenStrokes: 300,
      radicalColor: '#DC143C',
      delayBetweenLoops: 1000
    };
    this.store$.dispatch(loadCharacter({id: this.background, text: this.chineseTxt, properties: properties}))
  }

  onAnimate(){
    this.playing=true;
    this.characterService.startAnimation();
  }

  play(){
    this.playing=true;
    this.characterService.resumeAnimation();
  }
  pause(){
    this.playing=false;
    this.characterService.pauseAnimation();
  }
  changeBackground(type: string){
    this.background=type;
    this.characterService.destroyCharacter();
    this.createHanziAnimation();
  }
}
