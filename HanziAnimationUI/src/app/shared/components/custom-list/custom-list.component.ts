import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CharacterService } from 'src/app/character.service';
import { ModalService } from 'src/app/modal.service';
import { loadRelatedWords, moveListToTop, setActiveCharacterList, shouldSelectList, updateCharacter, updateList } from 'src/app/state/app.actions';
import { Character, List } from 'src/app/state/app.model';
import { AppState } from 'src/app/state/app.state';

@Component({
  selector: 'app-custom-list',
  templateUrl: './custom-list.component.html',
  styleUrls: ['./custom-list.component.scss']
})
export class CustomListComponent implements OnInit, OnChanges {
  modalHeader: string = 'Update';
  @Input() list!: List;
  @Input() listName!: string;
  @Input() nameWithSpaces!: string;
  @Output() moveList = new EventEmitter();
  openModal=false;
  decodedCardName!: string;
  cardNameWSpaces!:string;

  constructor(private readonly store: Store<AppState>, private router: Router, private readonly characterService: CharacterService,
    private readonly ms: ModalService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.list.cardname){
      this.decodedCardName = decodeURIComponent(this.list.cardname);
      this.cardNameWSpaces=this.decodedCardName.split(" ").join("");
      console.log(decodeURIComponent(this.list.cardname));
      //this.list.cardname = decodeURIComponent(this.list.cardname);
    }
  }

  ngOnInit(): void {
    //this.characterService.getHanziWriter().subscribe()
  }

  onClick(character: Character): void {
    this.store.dispatch(setActiveCharacterList({character:{active: true, value: character.value}, listName: this.listName, cardName: this.list.cardname}));
    this.store.dispatch(shouldSelectList({listname: this.listName}));
    this.store.dispatch(moveListToTop({listname: this.listName}));
    if (this.router.url === '/lists') {
      this.router.navigate(['/']);
    }
    this.moveList.emit(this.list);
    this.store.dispatch(updateCharacter({ character: character.value }))
    this.store.dispatch(loadRelatedWords({}));
  }

  onListClick(list: List) {
    if (this.router.url === '/lists') {
      this.router.navigate(['/']);
    }
    this.moveList.emit(list);
  }

  onCardBtnClick(){
    this.ms.openModal();

  }


}
