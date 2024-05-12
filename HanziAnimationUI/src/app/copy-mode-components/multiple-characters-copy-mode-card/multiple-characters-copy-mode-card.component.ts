import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import HanziWriter from 'hanzi-writer';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-multiple-characters-copy-mode-card',
  templateUrl: './multiple-characters-copy-mode-card.component.html',
  styleUrls: ['./multiple-characters-copy-mode-card.component.scss']
})
export class MultipleCharactersCopyModeCardComponent implements AfterViewInit,OnChanges {
  @Input() character!: string;
  @Input() characterIndex!: number;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mysvg', { static: false }) mysvg!: ElementRef<SVGSVGElement>;
  context: CanvasRenderingContext2D | null = null;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  color = '#000000';
  brushSize = 9;
  characterId: string='svgContainer';
  points: Point[] = [];
  totalPointsByStrokes: any = [];
  private writer!: HanziWriter;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes.character.currentValue);
    //console.log(changes.characterIndex.currentValue);
  }
  ngAfterViewInit(): void {
    if(this.character && this.characterIndex!==undefined){
      this.createHanziAnimation(this.character, this.characterIndex);
      const canvas = this.canvas.nativeElement;
      let svg: SVGSVGElement | null =
        this.mysvg.nativeElement.querySelector('div svg');
      this.context = this.canvas?.nativeElement?.getContext('2d');
      if (!this.context) {
        console.error('Failed to get 2d context from canvas.');
        return;
      }
      if (!svg) return;
      svg.addEventListener('mousedown', (e) => {
        this.startDrawingOnCanvas(e.offsetX, e.offsetY);
      });
      svg.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const svgRect = svg?.getBoundingClientRect();
        if (svgRect) {
          const offsetX = touch.clientX - svgRect?.left;
          const offsetY = touch.clientY - svgRect?.top;
          this.startDrawingOnCanvas(offsetX, offsetY);
        }
      });
      svg.addEventListener('mousemove', (e) => {
        this.continueDrawingOnCanvas(e.offsetX, e.offsetY);
      });
      svg.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const svgRect = svg?.getBoundingClientRect();
        if (svgRect) {
          const offsetX = touch.clientX - svgRect?.left;
          const offsetY = touch.clientY - svgRect?.top;
          this.continueDrawingOnCanvas(offsetX, offsetY);
        }
      });
      svg.addEventListener('mouseup', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('touchend', (e) => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('mouseleave', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('touchcancel', (e) => {
        this.stopDrawingOnCanvas();
      });
    }
    
  }

  stopDrawingOnCanvas() {
    this.isDrawing = false;
    if (this.points.length > 0) {
      this.totalPointsByStrokes.push(this.points);
      this.points = [];
    }
  }

  private startDrawingOnCanvas(x: number, y: number) {
    if (!this.context) return;
    this.isDrawing = true;
    this.context.strokeStyle = this.color; // Set stroke color
    this.context.lineWidth = this.brushSize; // Set stroke width
    this.context.lineCap = 'round'; // Set line cap
    this.context.beginPath();
    this.context.moveTo(x, y);
    this.lastX = x;
    this.lastY = y;
    this.points.push({ x, y });
  }

  private continueDrawingOnCanvas(x: number, y: number) {
    if (!this.context) return;
    if (this.isDrawing) {
      this.context.lineTo(x, y);
      this.context.stroke();
      this.lastX = x;
      this.lastY = y;
      this.points.push({ x, y });
    }
  }

  
  resetDrawing(){
    this.context?.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.points = [];
    this.totalPointsByStrokes = [];
    this.writer.cancelQuiz();
    this.writer.hideCharacter();
    this.writer.quiz();
  }


  createHanziAnimation(character: string, index?: number ): void{
    const id = index!==undefined? 'svgContainer'+index: 'svgContainer';
    this.characterId = id;
    let properties = {
      width: 300,
      height: 300,
      padding: 5,
      showCharacter: false,
      showOutline: true,
      strokeColor: '#EE00FF',
      showHintAfterMisses: 0,
      leniency: 1.0,
      acceptBackwardsStrokes: true,
    };
    //HanziWriter.create(id, character, properties);
    this.writer = HanziWriter.create(id, character, properties);
    this.writer.quiz();
  }

  public undo() {
    if (!this.context) return;
    // Clear the canvas
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    // Redraw all points except the last one
    if (this.totalPointsByStrokes.length > 1) {
      this.totalPointsByStrokes.pop();
      this.totalPointsByStrokes.forEach((points: any) => {
        points.forEach((point: Point, index: number) => {
          this.context?.beginPath();
          this.context?.lineTo(point.x, point.y);
          this.context?.stroke();
        });
      });
    }
  }


}
