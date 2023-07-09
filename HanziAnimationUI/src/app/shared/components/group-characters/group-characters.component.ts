import { AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { CharacterService } from 'src/app/character.service';
import { resetGroupWriter } from 'src/app/state/app.actions';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-group-characters',
  templateUrl: './group-characters.component.html',
  styleUrls: ['./group-characters.component.scss']
})
export class GroupCharactersComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {
  playing:boolean=false;
  strokeSpeed!:number;
  sliderVal=1;
  check=0;
  groupWriters: HanziWriter[]=[];
  playPause: any[]=[];
  strokeValues: any[]=[];
  background: string= 'character-target-';
  toggleBackground: any[]=[];
  currentBackgroundId!:number;
  animating:any[]=[];

  @Input() characters: string[]=[];
  @ViewChild('main') mainElement!: ElementRef;

  constructor(private readonly store$: Store<AppState>, private readonly characterService: CharacterService) { }
  ngAfterViewChecked(): void {
    if(this.check===0 && this.characters.length>1){
      // if(this.groupWriters.length===0){
      //   const mainNodes = this.mainElement.nativeElement.querySelectorAll('.wrapper-character');
      //   if(mainNodes.length>0){
      //     mainNodes.forEach((node:any, index:number)=>{
      //       const id = 'character-target-'+index;
      //       let svg = node.querySelector('#character-target-0>svg');
      //       if(svg!==null){
      //         node.removeChild(svg);
      //       }
      //     })
      //   }
      // }
      this.characters.forEach((item, index)=>{
        const writer=this.createHanziAnimation(item, index);
        this.groupWriters.push(writer);
      })
    }
    this.check++;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.check=0;
    this.toggleBackground=[];
    if(changes.characters && JSON.stringify(changes.characters.currentValue)!==JSON.stringify(changes.characters.previousValue)){
      this.store$.dispatch(resetGroupWriter())
      this.groupWriters=[];
      this.playPause=[];
      this.strokeValues=[];
      this.background='character-target-';
      this.animating=[];
      this.characters.forEach((item,index)=>{
        const c={
          initial: 'initial',
          triangle: '',
          square: ''
        };
        this.toggleBackground[index]=c;
      })
    }
  }
  
 
  ngAfterViewInit(): void {
    
  }
  

  ngOnInit(): void {
    this.strokeSpeed = 0.25;
    console.log(this.characters);
    
  }

  onSlide(index: number, range: string){
      this.strokeSpeed=0.25;
      this.strokeValues[index]= +range;
      this.strokeSpeed = +range*0.25;
      this.characterService.changeAnimationSpeed(this.strokeSpeed);
    
}
changeBackground(type: string, index: number){
  //this.toggleBackground[index]=!this.toggleBackground[index];
  this.currentBackgroundId=index;
  if(type==='grid-triangle-'){
    this.toggleBackground[index].triangle='triangle';
    this.toggleBackground[index].square='';
    this.toggleBackground[index].initial='';
  }
  if(type==='grid-square-'){
    this.toggleBackground[index].square='square';
    this.toggleBackground[index].triangle='';
    this.toggleBackground[index].initial='';
  }
  this.background=type;
  
  //this.characterService.destroyCharacter(this.groupWriters[index]);
  const writer=this.createHanziAnimation(this.characters[index], index);
  this.groupWriters.splice(index, 1, writer);
}

onAnimate(index: number){
  this.animating[index]=true;
  this.playing=true;
  this.characterService.startAnimation(this.groupWriters[index]);
  this.playPause[index] = true;
}

play(index: number){
  // if(this.characters.indexOf(character)===index){
  //   this.playing=true;
    this.characterService.resumeAnimation(this.groupWriters[index]);
  //}
  
}
back(index: number){
  this.characterService.reverseAnimation(this.groupWriters[index])
}
pause(index: number){
  // if(this.characters.indexOf(character)===index){
  //   this.playing=false;
    this.characterService.pauseAnimation(this.groupWriters[index]);
  //}
  
}

toggleButton(index: number){
  this.playPause[index] = !this.playPause[index];
}


  private createHanziAnimation(character: string, index: number): HanziWriter{
    
    const id=this.background+index;
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
    // if(svgNodes.length>0 && this.mainElement.nativeElement.id.includes(id)){
    //   return;
    // }
    return HanziWriter.create(id, character, properties);

  }

}
