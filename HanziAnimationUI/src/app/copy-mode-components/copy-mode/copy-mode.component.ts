import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import HanziWriter, { QuizOptions, StrokeData } from 'hanzi-writer';
import { CanvasPoint, getCanvasPoint } from 'src/app/common/canvas-pointer';
import {
  StrokeHistory,
  StrokeStyle,
  redrawStrokes,
} from 'src/app/common/stroke-history';

interface InkStroke {
  points: CanvasPoint[];
  style: StrokeStyle;
  /** Quiz stroke index at the moment this ink stroke began. */
  quizStrokeNumBefore: number;
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
  color = '#000000';
  brushSize = 9;
  characterId: string = 'svgContainer';
  isSingleCharacter = true;
  private readonly history = new StrokeHistory<InkStroke>();
  private currentPoints: CanvasPoint[] = [];
  private currentStyle: StrokeStyle | null = null;
  private writer!: HanziWriter;
  /** Stroke the quiz expects next. */
  private quizStrokeNum = 0;
  /** quizStrokeNum as of the current ink stroke's first point. */
  private quizStrokeNumAtStrokeStart = 0;

  constructor() {}

  get canUndo(): boolean {
    return !!this.context && this.history.canUndo;
  }

  get canRedo(): boolean {
    return !!this.context && this.history.canRedo;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.singleCharacter?.currentValue) {
      this.isSingleCharacter = true;
    }
    if (changes?.groups?.currentValue) {
      this.isSingleCharacter = false;
    }

    // This component is reused across searches: main-page keeps the same
    // instance mounted and only updates the input, so ngAfterViewInit does not
    // run again. Without this the previous character's ink stays in history and
    // redo would paint it onto the new character.
    const change = changes?.singleCharacter;
    if (
      change &&
      !change.firstChange &&
      change.currentValue &&
      change.currentValue !== change.previousValue
    ) {
      this.resetForNewCharacter(change.currentValue);
    }
  }

  ngAfterViewInit(): void {
    if (this.singleCharacter) {
      this.createHanziAnimation(this.singleCharacter);
      const svg = this.mysvg.nativeElement.querySelector<SVGSVGElement>('div svg');
      this.context = this.canvas?.nativeElement?.getContext('2d');
      if (!this.context) {
        console.error('Failed to get 2d context from canvas.');
        return;
      }
      // `const` matters: TypeScript does not carry the null check below into the
      // nested callbacks for a `let`, so `svg` would stay `SVGSVGElement | null`
      // at every getCanvasPoint call site.
      if (!svg) return;

      // Listeners stay on the hanzi-writer <svg>, which is also where its own
      // grading listeners live. Its handlers already call preventDefault() while
      // a quiz is active, so we must not add preventDefault/stopPropagation.
      svg.addEventListener('mousedown', (e) => {
        this.startDrawingOnCanvas(e, svg);
      });
      svg.addEventListener('touchstart', (e) => {
        this.startDrawingOnCanvas(e, svg);
      });
      svg.addEventListener('mousemove', (e) => {
        this.continueDrawingOnCanvas(e, svg);
      });
      svg.addEventListener('touchmove', (e) => {
        this.continueDrawingOnCanvas(e, svg);
      });
      svg.addEventListener('mouseup', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('touchend', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('mouseleave', () => {
        this.stopDrawingOnCanvas();
      });
      svg.addEventListener('touchcancel', () => {
        this.stopDrawingOnCanvas();
      });
    }
  }

  stopDrawingOnCanvas() {
    this.isDrawing = false;
    // hanzi-writer discards single-point strokes when grading, so keeping them
    // here would drift the ink and quiz sequences apart immediately. A stray tap
    // is not a stroke.
    if (this.currentPoints.length > 1 && this.currentStyle) {
      this.history.push({
        points: this.currentPoints,
        style: this.currentStyle,
        // Snapshot taken at stroke START, not read here -- by now hanzi-writer's
        // document-level endUserStroke may already have graded this attempt and
        // advanced quizStrokeNum.
        quizStrokeNumBefore: this.quizStrokeNumAtStrokeStart,
      });
    }
    this.currentPoints = [];
    this.currentStyle = null;
  }

  private startDrawingOnCanvas(e: MouseEvent | TouchEvent, rectSource: Element) {
    if (!this.context) return;
    const point = getCanvasPoint(e, rectSource);
    if (!point) return;

    this.isDrawing = true;
    // Capture the pre-grade quiz index. hanzi-writer's pointer-start handler only
    // calls Quiz.startUserStroke, which never advances _currentStrokeIndex, so
    // this read is unconditionally the value from before this attempt --
    // regardless of listener ordering.
    this.quizStrokeNumAtStrokeStart = this.quizStrokeNum;
    this.currentStyle = { color: this.color, brushSize: this.brushSize };
    this.currentPoints = [point];

    this.context.strokeStyle = this.currentStyle.color;
    this.context.lineWidth = this.currentStyle.brushSize;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.beginPath();
    this.context.moveTo(point.x, point.y);
  }

  private continueDrawingOnCanvas(e: MouseEvent | TouchEvent, rectSource: Element) {
    if (!this.context) return;
    if (!this.isDrawing) return;
    const point = getCanvasPoint(e, rectSource);
    if (!point) return;

    this.context.lineTo(point.x, point.y);
    this.context.stroke();
    this.currentPoints.push(point);
  }

  public undo() {
    const removed = this.history.undo();
    if (!removed || !this.context) return;
    redrawStrokes(this.context, this.canvas.nativeElement, this.history.strokes);
    // Step the reference character back with the ink so the two stay together.
    this.startQuizAt(removed.quizStrokeNumBefore);
  }

  public redo() {
    const restored = this.history.redo();
    if (!restored || !this.context) return;
    redrawStrokes(this.context, this.canvas.nativeElement, this.history.strokes);
    // Quiz deliberately left alone: the brief accepts ink/quiz desync, and
    // deriving a forward index adds bookkeeping with no visible gain.
  }

  resetDrawing() {
    this.history.clear();
    this.currentPoints = [];
    this.currentStyle = null;
    if (this.context) {
      redrawStrokes(this.context, this.canvas.nativeElement, []);
    }
    this.startQuizAt(0);
  }

  private resetForNewCharacter(character: string): void {
    this.history.clear();
    this.currentPoints = [];
    this.currentStyle = null;
    this.isDrawing = false;
    this.quizStrokeNum = 0;
    this.quizStrokeNumAtStrokeStart = 0;
    if (this.context) {
      redrawStrokes(this.context, this.canvas.nativeElement, []);
    }
    if (this.writer) {
      // setCharacter destroys and re-mounts the renderer, so it does not stack a
      // second <svg> the way another HanziWriter.create() on this id would.
      this.writer.setCharacter(character);
      this.startQuizAt(0);
    }
  }

  private quizOptions(): Partial<QuizOptions> {
    return {
      // Force the reference stroke to commit after ANY attempt, right or wrong,
      // so the learner never has to get it right before the stroke appears.
      // Side effect: _handleFailure never runs, so onMistake never fires and
      // showHintAfterMisses is inert.
      markStrokeCorrectAfterMisses: 1,
      leniency: 1.0,
      acceptBackwardsStrokes: true,
      // Fires for every attempt now that markStrokeCorrectAfterMisses is 1.
      // strokeNum is the index just completed (read before the increment).
      onCorrectStroke: (d: StrokeData) => {
        this.quizStrokeNum = d.strokeNum + 1;
      },
    };
  }

  /**
   * The only place quiz() is called.
   *
   * quiz() merges its options into the writer permanently, so once a rollback
   * has passed quizStartStrokeNum any later bare quiz() call would inherit that
   * index and silently stop resetting. Routing every call through here keeps
   * quizStartStrokeNum explicit. quiz() also cancels any running quiz itself.
   */
  private startQuizAt(index: number): void {
    if (!this.writer) return;
    this.quizStrokeNum = Math.max(0, index); // a negative would wrap in fixIndex
    this.writer.quiz({
      ...this.quizOptions(),
      quizStartStrokeNum: this.quizStrokeNum,
    });
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
      leniency: 1.0,
      acceptBackwardsStrokes: true,
    };
    this.writer = HanziWriter.create(id, character, properties);
    this.startQuizAt(0);
  }
}
