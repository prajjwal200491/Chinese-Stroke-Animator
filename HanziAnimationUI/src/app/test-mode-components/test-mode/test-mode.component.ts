import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { first } from 'rxjs/operators';
import { CharacterService } from 'src/app/character.service';
import { setChineseCharacterTickValue } from 'src/app/state/app.actions';
import { selectChineseCharactersList } from 'src/app/state/app.selector';

@Component({
  selector: 'app-test-mode',
  templateUrl: './test-mode.component.html',
  styleUrls: ['./test-mode.component.scss'],
})
export class TestModeComponent implements OnInit, AfterViewInit,OnChanges {
  @Input() groups: string[] = [];
  @Input() singleCharacter!: string;
  @ViewChild('canvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;
  characterId: string = 'svgContainer';
  isSingleCharacter = true;
  context: CanvasRenderingContext2D | null = null;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  color = '#000000';
  brushSize = 9;
  isCharacterTestCorrect=false;
  isCharacterTestCross=false;
  private writer!: HanziWriter;
  toggleShowHide = true;
  private strokes: { x: number; y: number; time: number }[][] = [];
  private currentStroke: { x: number; y: number; time: number }[] = [];
  private isRecording = false;
  timeoutId:any=undefined;
  static strokeData:any;
  static summaryData:any;

  constructor(private readonly characterS:CharacterService, private readonly store:Store) {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.singleCharacter?.currentValue) {
      this.isSingleCharacter = true;
    }
    if (changes?.groups?.currentValue) {
      this.isSingleCharacter = false;
    }
    this.store.select(selectChineseCharactersList).pipe(first()).subscribe(charactersWithTickedVal=>{
      if(changes?.character?.currentValue && changes?.character?.currentValue !== changes?.character?.previousValue){
       const match = charactersWithTickedVal.find(c=>c.character===changes.character.currentValue);
       if(match && match.hasOwnProperty('isTicked') && match.isTicked){
        this.isCharacterTestCorrect = true;
        this.isCharacterTestCross = false;
       } 
       else if(match && match.hasOwnProperty('isTicked') && !match.isTicked){
        this.isCharacterTestCross = true;
        this.isCharacterTestCorrect = false;
       }
      }
    })
  }
  ngAfterViewInit(): void {
    if (this.singleCharacter) {
      this.createHanziAnimation(this.singleCharacter);
      this.context = this.canvas?.nativeElement?.getContext('2d');
      if (!this.context) {
        console.error('Failed to get 2d context from canvas.');
        return;
      }
    }
  }

  private startRecording() {
    if (this.isDrawing) {
      this.isRecording = true;
      this.currentStroke = [];
      this.canvas.nativeElement.addEventListener('mousemove', (event) => {
        this.recordDrawing(event);
      });
      this.canvas.nativeElement.addEventListener('touchmove', (event) => {
        event.preventDefault();
        this.recordDrawing(event);
      });
    }
  }

  private stopRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.strokes.push(this.currentStroke);
      this.currentStroke = [];
      this.isDrawing = false;

      this.canvas.nativeElement.removeEventListener('mousemove', (event) =>
        this.recordDrawing(event)
      );
    }
  }

  

  private recordDrawing(event: MouseEvent | TouchEvent) {
    if (this.isRecording && this.isDrawing) {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      let x, y;
      if(event instanceof MouseEvent){
         x = event.clientX - rect.left;
         y = event.clientY - rect.top;
      }
      if (event instanceof TouchEvent) {
        const touch = event.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      }
      
      const time = Date.now();
      if(x && y){
        this.currentStroke.push({ x, y, time });

      this.drawPoint(x, y);
      }
      
    }
  }

  private drawPoint(x: number, y: number) {
    if (!this.context) return;
    this.context.beginPath();
    this.context.arc(x, y, 3, 0, 2 * Math.PI);
    this.context.fillStyle = 'black';
    this.context.fill();
  }

  mergeStrokes(strokes: { x: number; y: number; time: number }[][]) {
    let mergedStrokes: any = [];
    if (strokes.length > 0) {
      strokes.forEach((stroke, index) => {
        let currentStroke = stroke;
        currentStroke = currentStroke.map((s) => {
          return {
            ...s,
            strokeIndex: index,
          };
        });
        mergedStrokes = [...mergedStrokes, ...currentStroke];
      });
    }
    return mergedStrokes;
  }

  playRecording() {
    this.context?.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    const mergedS = this.mergeStrokes(this.strokes);
    const queue = [...mergedS]; // Copy strokes to a new array

    const drawNextStroke = () => {
      if (queue.length > 0) {
        this.drawStrokeWithTiming(queue);
      }
    };

    drawNextStroke();
    //this.strokes = [];
  }

  drawStrokeWithTiming(
    stroke:
      | { x: number; y: number; time: number; strokeIndex: number }[]
      | undefined
  ) {
    let index = 0;

    const drawNextSegment = () => {
      if (!this.context || !stroke) return;

      if (index < stroke.length - 1) {
        const startPoint = stroke[index];
        const endPoint = stroke[index + 1];
        if (startPoint.strokeIndex === endPoint.strokeIndex) {
          this.context.beginPath();
          this.context.moveTo(startPoint.x, startPoint.y);
          this.context.lineTo(endPoint.x, endPoint.y);
          this.context.strokeStyle = 'black';
          this.context.lineWidth = 9; // Adjust the stroke width
          this.context.stroke();
        }

        const timeDifference = stroke[index + 1].time - startPoint.time;
        this.timeoutId = setTimeout(drawNextSegment, timeDifference); // Adjust the delay based on the time difference
        index++;
      }
    };

    drawNextSegment();
  }

  startDrawing(e: MouseEvent | TouchEvent) {
    if(e instanceof TouchEvent){
      const clientX = e.touches[0].clientX
    const clientY = e.touches[0].clientY
    this.isDrawing = true;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    [this.lastX, this.lastY] = [clientX-rect.left, clientY-rect.top];
    this.startRecording();
    }
    if(e instanceof MouseEvent){
      this.isDrawing = true;
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    this.startRecording();
    }
  }

  draw(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    if (!this.context) return;
    if (e instanceof TouchEvent) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.brushSize;
      this.context.lineCap = 'round';

      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.context.lineTo(x, y);
      this.context.stroke();
      [this.lastX, this.lastY] = [x, y];
    }
    if (e instanceof MouseEvent) {
      this.context.strokeStyle = this.color;
      this.context.lineWidth = this.brushSize;
      this.context.lineCap = 'round';

      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.context.lineTo(e.offsetX, e.offsetY);
      this.context.stroke();
      [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }
  }

  stopDrawing() {
    this.isDrawing = false;
    this.stopRecording();
  }
  resetDrawing() {
    this.context?.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    clearTimeout(this.timeoutId);
    this.strokes=[];
  }

  showHideCharacter() {
    this.toggleShowHide = !this.toggleShowHide;
    this.toggleShowHide
      ? this.writer.showCharacter()
      : this.writer.hideCharacter();
  }

  runAnimation(){
    this.writer.animateCharacter();
  }

  onCompare(){
    this.runAnimation();
    this.playRecording();
  }

  onComparisonCheck(isChecked:boolean){
    const data={
      isTicked: isChecked,
      characterValue: this.singleCharacter
    }
    if(isChecked){
      this.isCharacterTestCorrect = true;
      this.isCharacterTestCross=false;
    }
    else{
      this.isCharacterTestCross = true;
      this.isCharacterTestCorrect=false;
    }
    this.characterS.setComparisonValues(data);
    this.store.dispatch(setChineseCharacterTickValue({chineseCharacter:{
      character:data.characterValue,
      isTicked: data.isTicked
    }}))
  }

  createHanziAnimation(character: string, index?: number): void {
    const id = index !== undefined ? 'svgContainer' + index : 'svgContainer';
    this.characterId = id;
    let properties = {
      width: 300,
      height: 300,
      padding: 5,
      showOutline: false,
      strokeColor: '#847676',
    };
    this.writer = HanziWriter.create(id, character, properties);
  }
  get strokeData(){
    return TestModeComponent.strokeData;
  }
  get summaryData(){
    return TestModeComponent.summaryData;
  }
  createHanziQuiz(): void {
    let properties = {
      width: 300,
      height: 300,
      padding: 5,
      showCharacter: false,
    };
    const w = HanziWriter.create('quiz-mode', this.singleCharacter, properties);
    w.quiz({
      onMistake: function(strokeData) {
        TestModeComponent.strokeData = strokeData;
        console.log('Oh no! you made a mistake on stroke ' + strokeData.strokeNum);
        console.log("You've made " + strokeData.mistakesOnStroke + " mistakes on this stroke so far");
        console.log("You've made " + strokeData.totalMistakes + " total mistakes on this quiz");
        console.log("There are " + strokeData.strokesRemaining + " strokes remaining in this character");
      },
      onCorrectStroke: function(strokeData) {
        TestModeComponent.strokeData = strokeData;
        console.log('Yes!!! You got stroke ' + strokeData.strokeNum + ' correct!');
        console.log('You made ' + strokeData.mistakesOnStroke + ' mistakes on this stroke');
        console.log("You've made " + strokeData.totalMistakes + ' total mistakes on this quiz');
        console.log('There are ' + strokeData.strokesRemaining + ' strokes remaining in this character');
      },
      onComplete: function(summaryData) {
        TestModeComponent.summaryData=summaryData;
        console.log('You did it! You finished drawing ' + summaryData.character);
        console.log('You made ' + summaryData.totalMistakes + ' total mistakes on this quiz');
      }
    });
  }
}
