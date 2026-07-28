import { CanvasPoint } from './canvas-pointer';

export interface StrokeStyle {
  color: string;
  brushSize: number;
}

/** Minimum a stroke must carry to be repainted from history. */
export interface PaintableStroke {
  points: CanvasPoint[];
  style: StrokeStyle;
}

/**
 * Per-component undo/redo over whole stroke records.
 *
 * Deliberately a plain class, not an `@Injectable`. A root-provided service
 * would be a singleton, so with "你好" on screen -- two cards -- undo on the
 * second card would pop the first card's stroke.
 *
 * Generic over the entire stroke record rather than over the point, so copy
 * mode can hang its quiz snapshot off the stroke without this class knowing
 * hanzi-writer exists.
 *
 * No depth cap: evicting the oldest stroke while the canvas stays painted from
 * the truncated array would make that stroke silently vanish with no way to get
 * it back. Per-stroke point arrays are trivial next to the 4 MB dictionary this
 * app already loads.
 */
export class StrokeHistory<T> {
  private done: T[] = [];
  private undone: T[] = [];

  get strokes(): readonly T[] {
    return this.done;
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  push(stroke: T): void {
    this.done.push(stroke);
    this.undone = []; // a new stroke invalidates the redo branch
  }

  undo(): T | undefined {
    const stroke = this.done.pop();
    if (stroke !== undefined) {
      this.undone.push(stroke);
    }
    return stroke;
  }

  redo(): T | undefined {
    const stroke = this.undone.pop();
    if (stroke !== undefined) {
      this.done.push(stroke);
    }
    return stroke;
  }

  clear(): void {
    this.done = [];
    this.undone = [];
  }
}

/**
 * Repaints the canvas from history, restoring each stroke's own colour and
 * width.
 *
 * Replaces the previous per-point `moveTo(p); lineTo(p); stroke()` loop, which
 * emitted zero-length segments instead of a polyline (and in the card variant
 * omitted `moveTo` entirely, so it rendered nothing at all -- the "undo erases
 * everything" symptom). Reading style from the stroke rather than from the live
 * picker is what stops undo recolouring earlier strokes.
 */
export function redrawStrokes(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  strokes: readonly PaintableStroke[]
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of strokes) {
    if (stroke.points.length === 0) {
      continue;
    }
    ctx.strokeStyle = stroke.style.color;
    ctx.lineWidth = stroke.style.brushSize;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }
}
