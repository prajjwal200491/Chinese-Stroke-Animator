import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
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
  strokeSpeed!:number;
  writer!: HanziWriter;
  @Input() chineseTxt!:string;
  background: string= 'character-target-div';
  sliderVal=1;
  sid='slider-speed';

  constructor(private readonly store$: Store<AppState>, private readonly characterService: CharacterService) { 
  }

  ngOnInit(): void {
    this.strokeSpeed = 0.25;
    this.writer=this.createHanziAnimation();
    this.characterService.startAnimation(this.writer);
    this.playing=true;
  }
  
  ngOnChanges(sc: SimpleChanges):void{
    if(sc.chineseTxt && sc.chineseTxt.currentValue!==sc.chineseTxt.previousValue && this.chineseTxt!==''){
      this.store$.dispatch(updateCharacter({character: this.chineseTxt}));
    }
  }

  onSlide(){
      this.strokeSpeed = this.sliderVal*0.25;
      this.characterService.changeAnimationSpeed(this.strokeSpeed);
  }

  onAnimate(){
    this.playing=true;
    this.characterService.startAnimation(this.writer);
  }

  play(){
    this.playing=true;
    this.characterService.resumeAnimation(this.writer);
  }
  back(){
    this.characterService.reverseAnimation(this.writer)
  }
  pause(){
    this.playing=false;
    this.characterService.pauseAnimation(this.writer);
  }
  changeBackground(type: string){
    this.background=type;
    this.characterService.destroyCharacter(this.writer);
    this.writer=this.createHanziAnimation();
  }

  private createHanziAnimation(): HanziWriter{
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
    //this.store$.dispatch(loadCharacter({id: this.background, text: this.chineseTxt, properties: properties}))
    const writer = HanziWriter.create(this.background, this.chineseTxt, properties);
    this.characterService.setHanziWriter(writer);
    return writer;
  }
}
