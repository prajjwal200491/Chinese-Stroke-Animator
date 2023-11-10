import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Character, List, ListData } from '../state/app.model';
import { CharacterService } from '../character.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { selectListDataWithCards } from '../state/app.selector';
import { map, take } from 'rxjs/operators';
import { addWordList } from '../state/app.actions';

@Component({
  selector: 'app-add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss']
})
export class AddCardModalComponent implements OnInit, OnChanges {
  @Input() modalId!: string;
  @Input() listName!: any;
  @Input() nameWithSpaces!: any;
  cardForm: FormGroup;
  wordList: Character[]=[];
  listData$!: Observable<any>;

  constructor(private readonly fb: FormBuilder, private readonly characterService: CharacterService, private readonly store: Store<AppState>) {
    this.cardForm = this.fb.group({
      listname: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      words: ['', [Validators.required, Validators.minLength(1)]]
    })
   }

  ngOnInit(): void {
    this.listData$ = this.store.select(selectListDataWithCards);
    this.cardForm.patchValue({
      listname: this.nameWithSpaces,
      //characters: this.list.characters.map(c => c.value).join('')
    })
    this.cardForm.get('listname')?.disable();
  }

  ngOnChanges():void{
  }

  get listname() {
    return this.cardForm.get('listname')
  }
  get name() {
    return this.cardForm.get('name')
  }


  get words(){
    return this.cardForm.get('words')
  }
  
  removeFromList(index: number){
    this.wordList.splice(index,1)
  }


  addToWordsList(item: AbstractControl | null) {
    if (item !== null) {
      const character={value: item.value.split(" ").join(""), active: false};
        this.wordList.push(character);
      
    }

  }

  onSubmitCard(){
    this.listData$.pipe(take(1)).subscribe(data=>{
      if(data && this.listName){
        let list = data[this.listName];
        let card: List = {
              nameWithoutSpaces: this.cardForm.get('name')?.value.split(" ").join(""),
              nameWithSpaces: this.cardForm.get('name')?.value,
              selected: false,
              characters: this.wordList
        }
        let values:any={};
        values[card.nameWithoutSpaces]= card;
        values={
          ...list.values, ...values
        }
        let final:ListData = {
          nameWithoutSpaces: this.listName.split(" ").join(""),
          nameWithSpaces: this.listName,
          values
        };
        this.store.dispatch(addWordList({list: final})) ;
      }
    })
  }
}
