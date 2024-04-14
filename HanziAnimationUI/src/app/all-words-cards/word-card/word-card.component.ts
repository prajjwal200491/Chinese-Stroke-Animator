import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-word-card',
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.scss']
})
export class WordCardComponent implements OnInit {

  @Input() word:any;
  @Output() onWordCardClick = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onItemClick(word:any){
    this.onWordCardClick.emit(word);
  }

}
