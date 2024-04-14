import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import HanziWriter from 'hanzi-writer';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-copy-mode',
  templateUrl: './copy-mode.component.html',
  styleUrls: ['./copy-mode.component.scss'],
})
export class CopyModeComponent implements AfterViewInit, OnChanges {
  @Input() groups: string[] = [];
  @Input() singleCharacter!: string;
  @ViewChild('canvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mysvg', { static: false }) mysvg!: ElementRef<SVGSVGElement>;
  context: CanvasRenderingContext2D | null = null;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  color = '#000000';
  brushSize = 9;
  characterId: string = 'svgContainer';
  isSingleCharacter = true;
  points: Point[] = [];
  totalPointsByStrokes: any = [];
  private writer!: HanziWriter;

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.singleCharacter?.currentValue) {
      this.isSingleCharacter = true;
    }
    if (changes?.groups?.currentValue) {
      this.isSingleCharacter = false;
    }
  }
  ngAfterViewInit(): void {
    if (this.singleCharacter) {
      this.createHanziAnimation(this.singleCharacter);
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
      svg.addEventListener('mousemove', (e) => {
        this.continueDrawingOnCanvas(e.offsetX, e.offsetY);
      });
      svg.addEventListener('mouseup', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('mouseleave', () => {
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

  resetDrawing() {
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

  createHanziAnimation(character: string, index?: number): void {
    const id = index !== undefined ? 'svgContainer' + index : 'svgContainer';
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
          this.context?.moveTo(point.x,point.y);
          this.context?.lineTo(point.x, point.y);
          this.context?.stroke();
        });
      });
    }
  }
}
