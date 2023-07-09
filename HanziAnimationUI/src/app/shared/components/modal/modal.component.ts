import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CharacterService } from 'src/app/character.service';
import { addNewList, addWordList, loadWordsList, reschuffleList, updateList, updateWordList } from 'src/app/state/app.actions';
import { List } from 'src/app/state/app.model';
import { AppState } from 'src/app/state/app.state';
import {Character} from '../../../state/app.model'
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() modalId!: string;
  @Input() header!: string;
  @Input() list!: List;
  @Input() disabled!: boolean;
  listForm: FormGroup;
  wordList: Character[]=[];

  constructor(private readonly fb: FormBuilder, private readonly store: Store<AppState>, private readonly characterService: CharacterService) {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      word: ['', [Validators.required, Validators.minLength(1)]],
      groups: ['', [Validators.minLength(2)]],
      characters: [[''], [Validators.required, Validators.minLength(1)]]
    })
  }

  ngOnInit(): void {
    this.wordList=[...this.list.characters];

    this.listForm.patchValue({
      name: this.list?.name,
      //characters: this.list.characters.map(c => c.value).join('')
    })
  }

  get name() {
    return this.list.name
  }

  get word() {
    return this.listForm.get('word')
  }

  

  get groups(){
    return this.listForm.get('groups')
  }

  removeFromList(index: number){
    this.wordList.splice(index,1)
  }

  addToWordsList(item: AbstractControl | null) {
    if (item !== null) {
    const character={value: item.value, active: false};
      if(this.header==='Create'){
        this.wordList.push(character);
      }
      else{
        this.wordList=[...this.wordList, character]
      }
      
    }

  }


  onSubmit(): void {
    
    if (this.header === 'Create') {
      const final:List={
        name: this.listForm.get('name')?.value,
        characters: this.wordList,
        selected: false
      }
      this.store.dispatch(addWordList({list: final}));
      //this.store.dispatch(reschuffleList({list:final}));
    }
    else{
      const final: List = {
        ...this.list,
        characters: this.wordList,
      }
      this.store.dispatch(updateWordList({list: final}));
      //this.store.dispatch(reschuffleList({list:final}));
    }
  }

}
