import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CharacterService } from '../character.service';
import { loadCharacterDecomposition, loadRelatedWords, updateCharacter } from '../state/app.actions';
import { selectCharacterDecomposition, selectGroupDecomposition, selectGroupRelatedWords, selectRelatedWords } from '../state/app.selector';
import { AppState } from '../state/app.state';
import HanziWriter from 'hanzi-writer';

@Component({
  selector: 'app-character-decomposition',
  templateUrl: './character-decomposition.component.html',
  styleUrls: ['./character-decomposition.component.scss']
})
export class CharacterDecompositionComponent implements OnInit {

  decomposition!: string[]|undefined;
  relatedWords$!: Observable<string|undefined>;
  writer!: HanziWriter;
  @Input() character!: string;

  constructor(private readonly store: Store<AppState>, private readonly characterService: CharacterService) { }
  

  ngOnInit(): void {
    if(this.character){
      this.store.select(selectGroupDecomposition, {character: this.character}).subscribe(item=> {
        this.decomposition=item && item.decomposition?.split('');
      })
      this.relatedWords$=this.store.select(selectGroupRelatedWords, {character: this.character});
    }
    else{
      this.store.dispatch(loadCharacterDecomposition({}));
    this.store.dispatch(loadRelatedWords({}));
    this.store.select(selectCharacterDecomposition).subscribe(items=> {
      this.decomposition=items.split('');
    })
    this.relatedWords$=this.store.select(selectRelatedWords);
    this.characterService.getHanziWriter().subscribe(w=> this.writer=w);
    }
    
  }

  onClick(character: string){
    this.characterService.destroyCharacter(this.writer);
    this.store.dispatch(updateCharacter({character: character}));
    this.store.dispatch(loadRelatedWords({}));
  }

}
