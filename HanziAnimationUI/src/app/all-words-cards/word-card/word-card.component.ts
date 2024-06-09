import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { shouldSelectList } from 'src/app/state/app.actions';

@Component({
  selector: 'app-word-card',
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.scss']
})
export class WordCardComponent implements OnInit {

  @Input() word:any;
  @Output() onWordCardClick = new EventEmitter();

  constructor(private readonly store: Store) { }

  ngOnInit(): void {
  }

  onItemClick(word:any){
    this.onWordCardClick.emit(word);
    this.store.dispatch(shouldSelectList({listname: word.listname}));
  }

}
