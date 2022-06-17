import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CharacterService } from '../character.service';
import { loadCharacterDecomposition, loadRelatedWords, updateCharacter } from '../state/app.actions';
import { selectCharacterDecomposition, selectRelatedWords } from '../state/app.selector';
import { AppState } from '../state/app.state';

@Component({
  selector: 'app-character-decomposition',
  templateUrl: './character-decomposition.component.html',
  styleUrls: ['./character-decomposition.component.scss']
})
export class CharacterDecompositionComponent implements OnInit {

  decomposition!: string[];
  relatedWords$!: Observable<string>;

  constructor(private readonly store: Store<AppState>, private readonly characterService: CharacterService) { }

  ngOnInit(): void {
    this.store.dispatch(loadCharacterDecomposition());
    this.store.dispatch(loadRelatedWords());
    this.store.select(selectCharacterDecomposition).subscribe(items=> {
      this.decomposition=items.split('');
    })
    this.relatedWords$=this.store.select(selectRelatedWords);
  }

  onClick(character: string){
    this.characterService.destroyCharacter();
    this.store.dispatch(updateCharacter({character: character}));
    this.store.dispatch(loadRelatedWords());
  }

}
