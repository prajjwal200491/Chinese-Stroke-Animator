import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

declare const RecordableDrawing:any;

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss'],
})
export class DrawingCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasElement', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

   drawing: any;
   recording: boolean = false;
   playback: boolean = false;
   paused: boolean = false;

  constructor() { }
  ngOnInit(): void {
    this.drawing = new RecordableDrawing(this.canvas.nativeElement.id);
  }

  ngAfterViewInit() {
    this.drawing = new RecordableDrawing(this.canvas.nativeElement.id);
    console.log(this.drawing);
  }

  toggleRecording() {
    if (this.recording) {
      this.drawing.stopRecording();
    } else {
      this.drawing.startRecording();
    }
    this.recording = !this.recording;
  }

  togglePlayback() {
    if (this.playback) {
      this.drawing.stopPlayback();
    } else {
      this.drawing.startPlayback({
        onStart: () => {
          this.playback = true;
          this.paused = false;
        },
        onEnd: () => {
          this.playback = false;
          this.paused = false;
        },
        onPause: () => {
          this.paused = true;
        },
        onResume: () => {
          this.paused = false;
        },
        checkStatus: () => {
          return this.paused ? 'pause' : '';
        }
      });
    }
  }

  togglePause() {
    if (this.paused) {
      this.drawing.resumePlayback();
    } else {
      this.drawing.pausePlayback();
    }
    this.paused = !this.paused;
  }

  clearCanvas() {
    this.drawing.clearCanvas();
  }
  
}
