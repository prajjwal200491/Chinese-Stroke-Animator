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
  publicWordCards:any;
  privateWordCards:any;
  @Output() onWordCardClick = new EventEmitter();

  selectedFolderTab: 'public' | 'private' | 'shared' = 'public';

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.wordCards?.currentValue?.length>0){
      this.publicWordCards = this.wordCards.filter((card:any)=> card.isPublic);
      this.privateWordCards = this.wordCards.filter((card:any)=> !card.isPublic);
    }
  }

  ngOnInit(): void {
    console.log(this.wordCards);
    

  }

  onHandleCardClick(word:any){
    this.onWordCardClick.emit(word)
  }

}
