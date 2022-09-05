import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
declare const HanziWriter: any;

@Component({
  selector: 'app-character-strokes',
  templateUrl: './character-strokes.component.html',
  styleUrls: ['./character-strokes.component.scss']
})
export class CharacterStrokesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chineseTxt!: string | null;
  @ViewChild('strokes') characterStroke!: ElementRef;
  target: any;

  constructor() { }

  ngOnChanges(sc: SimpleChanges): void {
    if (sc.chineseTxt && sc.chineseTxt.currentValue !== sc.chineseTxt.previousValue) {
      this.removeOldStrokes();
      this.loadCharacterData();
    }
  }

  ngOnInit(): void {
    //import('hanzi-writer-data/⺗.json').then(res=>console.log(res));
    /* HanziWriter.loadCharacterData('開', {
      showOutline: true
    }).then((charData:any)=> {
      var target = document.getElementById('target');
      for (var i = 0; i < charData.strokes.length; i++) {
        var strokesPortion = charData.strokes.slice(0, i + 1);
        this.renderFanningStrokes(target, strokesPortion);
      }
    }); */
  }

  ngOnDestroy(): void {
    //this.target.remove();
  }

  private loadCharacterData() {
    HanziWriter.loadCharacterData(this.chineseTxt).then((charData: any) => {
      this.target = document.getElementById('target');
      for (var i = 0; i < charData.strokes.length; i++) {
        var strokesPortion = charData.strokes.slice(0, i + 1);
        this.renderFanningStrokes(this.characterStroke.nativeElement, strokesPortion);
      }
    });
  }

  private renderFanningStrokes(target: any, strokes: any[]): void {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = '50px';
    svg.style.height = '50px';
    svg.style.border = '2px solid #00BFFF';
    target.appendChild(svg);
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let transformData = HanziWriter.getScalingTransform(50, 50);
    group.setAttributeNS(null, 'transform', transformData.transform);
    svg.appendChild(group);
    strokes.forEach(function (strokePath: string) {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'd', strokePath);
      // style the character paths
      path.style.fill = '#555';
      group.appendChild(path);
    });
  }
  private removeOldStrokes() {
    if (this.characterStroke) {
      let totalStrokes = this.characterStroke?.nativeElement.querySelectorAll('svg');
      totalStrokes.forEach((item: any) => {
        this.characterStroke?.nativeElement.removeChild(item);
      })
    }
  }
}
