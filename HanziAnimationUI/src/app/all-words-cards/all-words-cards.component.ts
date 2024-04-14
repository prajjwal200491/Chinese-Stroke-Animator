import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-all-words-cards',
  templateUrl: './all-words-cards.component.html',
  styleUrls: ['./all-words-cards.component.scss']
})
export class AllWordsCardsComponent implements OnInit, OnChanges {
  @Input() wordCards:any;
  @Input() nameWithSpaces!: any;
  @Input() header!: string;
  isSelected=false;
  @Output() onWordCardClick = new EventEmitter();

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.wordCards)
  }

  ngOnInit(): void {
  }

  onHandleCardClick(word:any){
    this.onWordCardClick.emit(word)
  }

}
