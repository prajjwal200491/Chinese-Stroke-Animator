import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import HanziWriter from 'hanzi-writer';
import { first } from 'rxjs/operators';
import { CharacterService } from 'src/app/character.service';
import { DictionaryService } from 'src/app/dictionary.service';
import { TimedPoint, getCanvasPoint, isTouchEvent } from 'src/app/common/canvas-pointer';
import {
  StrokeHistory,
  StrokeStyle,
  redrawStrokes,
} from 'src/app/common/stroke-history';
import { setChineseCharacterTickValue } from 'src/app/state/app.actions';
import { selectChineseCharactersList } from 'src/app/state/app.selector';
import { ChineseCharacter } from 'src/app/state/app.state';

interface TimedStroke {
  points: TimedPoint[];
  style: StrokeStyle;
}

interface MergedPoint extends TimedPoint {
  strokeIndex: number;
  style: StrokeStyle;
}

@Component({
  selector: 'app-multiple-characters-test-mode-card',
  templateUrl: './multiple-characters-test-mode-card.component.html',
  styleUrls: ['./multiple-characters-test-mode-card.component.scss'],
})
export class MultipleCharactersTestModeCardComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() character!: string;
  @Input() characterIndex!: number;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  context: CanvasRenderingContext2D | null = null;
  private readonly history = new StrokeHistory<TimedStroke>();
  private currentPoints: TimedPoint[] = [];
  private currentStyle: StrokeStyle | null = null;
  timeoutId: any = undefined;
  /** See TestModeComponent: guards a replay in flight against a repaint. */
  private replayToken = 0;
  isDrawing = false;
  color = '#000000';
  brushSize = 9;
  characterId: string = 'svgContainer';
  toggleShowHide = true;
  isCharacterTestCorrect = false;
  isCharacterTestCross = false;
  pinyin = '';
  private writer!: HanziWriter;
  charactersWithTickedVal!: ChineseCharacter[];

  constructor(
    private readonly characterS: CharacterService,
    private readonly store: Store,
    private readonly dictionary: DictionaryService
  ) {}

  get canUndo(): boolean {
    return !!this.context && this.history.canUndo;
  }

  get canRedo(): boolean {
    return !!this.context && this.history.canRedo;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes?.character;
    if (change?.currentValue && change.currentValue !== change.previousValue) {
      const character: string = change.currentValue;

      if (!change.firstChange) {
        // The parent *ngFor has no trackBy, so these cards are reused by index
        // when the search changes. Without clearing, redo would paint the
        // previous character's ink onto the new one.
        this.resetForNewCharacter(character);
      }

      this.dictionary.getPinyin(character).subscribe((p) => (this.pinyin = p));

      this.isCharacterTestCorrect = false;
      this.isCharacterTestCross = false;
      this.store
        .select(selectChineseCharactersList)
        .pipe(first())
        .subscribe((charactersWithTickedVal) => {
          const match = charactersWithTickedVal.find((c) => c.character === character);
          if (match && match.hasOwnProperty('isTicked')) {
            this.isCharacterTestCorrect = !!match.isTicked;
            this.isCharacterTestCross = !match.isTicked;
          }
        });
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.character && this.characterIndex !== undefined) {
      this.createHanziAnimation(this.character, this.characterIndex);
      this.context = this.canvas?.nativeElement?.getContext('2d');
      if (!this.context) {
        console.error('Failed to get 2d context from canvas.');
        return;
      }
    }
  }

  startDrawing(e: MouseEvent | TouchEvent) {
    if (!this.context) return;
    const point = getCanvasPoint(e, this.canvas.nativeElement);
    if (!point) return;

    this.isDrawing = true;
    this.currentStyle = { color: this.color, brushSize: this.brushSize };
    this.currentPoints = [{ ...point, time: Date.now() }];
  }

  draw(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    if (!this.context || !this.currentStyle) return;
    if (isTouchEvent(e)) {
      // Belt and braces alongside `touch-action: none` in the stylesheet.
      e.preventDefault();
    }
    const point = getCanvasPoint(e, this.canvas.nativeElement);
    if (!point) return;

    const previous = this.currentPoints[this.currentPoints.length - 1];
    this.currentPoints.push({ ...point, time: Date.now() });

    this.context.strokeStyle = this.currentStyle.color;
    this.context.lineWidth = this.currentStyle.brushSize;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.beginPath();
    this.context.moveTo(previous ? previous.x : point.x, previous ? previous.y : point.y);
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentPoints.length > 1 && this.currentStyle) {
      this.history.push({ points: this.currentPoints, style: this.currentStyle });
    }
    this.currentPoints = [];
    this.currentStyle = null;
  }

  undo() {
    const removed = this.history.undo();
    if (!removed || !this.context) return;
    this.cancelPlayback();
    redrawStrokes(this.context, this.canvas.nativeElement, this.history.strokes);
  }

  redo() {
    const restored = this.history.redo();
    if (!restored || !this.context) return;
    this.cancelPlayback();
    redrawStrokes(this.context, this.canvas.nativeElement, this.history.strokes);
  }

  private cancelPlayback(): void {
    this.replayToken++;
    clearTimeout(this.timeoutId);
  }

  onCompare() {
    this.runAnimation();
    this.playRecording();
  }

  runAnimation() {
    this.writer.animateCharacter();
  }

  mergeStrokes(strokes: readonly TimedStroke[]): MergedPoint[] {
    let mergedStrokes: MergedPoint[] = [];
    strokes.forEach((stroke, index) => {
      const points = stroke.points.map((p) => ({
        ...p,
        strokeIndex: index,
        style: stroke.style,
      }));
      mergedStrokes = [...mergedStrokes, ...points];
    });
    return mergedStrokes;
  }

  playRecording() {
    if (!this.context) return;
    this.cancelPlayback();
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    const merged = this.mergeStrokes(this.history.strokes);
    if (merged.length > 0) {
      this.drawStrokeWithTiming(merged, this.replayToken);
    }
  }

  drawStrokeWithTiming(stroke: MergedPoint[] | undefined, token: number) {
    let index = 0;

    const drawNextSegment = () => {
      // A repaint from history (undo/redo/reset) invalidates this replay.
      if (token !== this.replayToken) return;
      if (!this.context || !stroke) return;

      if (index < stroke.length - 1) {
        const startPoint = stroke[index];
        const endPoint = stroke[index + 1];
        if (startPoint.strokeIndex === endPoint.strokeIndex) {
          this.context.beginPath();
          this.context.moveTo(startPoint.x, startPoint.y);
          this.context.lineTo(endPoint.x, endPoint.y);
          this.context.strokeStyle = startPoint.style.color;
          this.context.lineWidth = startPoint.style.brushSize;
          this.context.lineCap = 'round';
          this.context.lineJoin = 'round';
          this.context.stroke();
        }

        const timeDifference = Math.max(0, endPoint.time - startPoint.time);
        this.timeoutId = setTimeout(drawNextSegment, timeDifference);
        index++;
      }
    };

    drawNextSegment();
  }

  onComparisonCheck(isChecked: boolean) {
    const data = {
      isTicked: isChecked,
      characterValue: this.character,
    };
    if (isChecked) {
      this.isCharacterTestCorrect = true;
      this.isCharacterTestCross = false;
    } else {
      this.isCharacterTestCross = true;
      this.isCharacterTestCorrect = false;
    }
    this.characterS.setComparisonValues(data);
    this.store.dispatch(
      setChineseCharacterTickValue({
        chineseCharacter: {
          character: data.characterValue,
          isTicked: data.isTicked,
        },
      })
    );
  }

  createHanziAnimation(character: string, index?: number): void {
    const id = index !== undefined ? 'svgContainer' + index : 'svgContainer';
    this.characterId = id;
    let properties = {
      width: 250,
      height: 250,
      padding: 5,
      showOutline: false,
      strokeColor: '#847676',
    };
    this.writer = HanziWriter.create(id, character, properties);
  }

  resetDrawing() {
    this.cancelPlayback();
    this.history.clear();
    this.currentPoints = [];
    this.currentStyle = null;
    this.isDrawing = false;
    if (this.context) {
      redrawStrokes(this.context, this.canvas.nativeElement, []);
    }
  }

  private resetForNewCharacter(character: string): void {
    this.resetDrawing();
    this.toggleShowHide = true;
    if (this.writer) {
      this.writer.setCharacter(character);
    }
  }

  speak() {
    this.dictionary.speak(this.character);
  }

  showHideCharacter() {
    this.toggleShowHide = !this.toggleShowHide;
    this.toggleShowHide ? this.writer.showCharacter() : this.writer.hideCharacter();
  }
}
