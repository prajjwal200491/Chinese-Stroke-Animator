import { AfterViewChecked, AfterViewInit, Component, DoCheck, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CharacterService } from 'src/app/character.service';
import { addNewList, addWordList, loadWordsList, reschuffleList, updateList, updateWordList } from 'src/app/state/app.actions';
import { List, ListData } from 'src/app/state/app.model';
import { AppState } from 'src/app/state/app.state';
import {Character} from '../../../state/app.model'
import { selectListDataWithCards } from 'src/app/state/app.selector';
import { take } from 'rxjs/operators';
import { ModalService } from 'src/app/modal.service';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('myModal') myModal!:ElementRef;
  @ViewChild('cardInputBox') cardInputBox!:ElementRef;
  @ViewChild('listInputBox') listInputBox!:ElementRef;
  @Input() modalId!: string;
  @Input() listName!: any;
  @Input() nameWithSpaces!: any;
  @Input() header!: string;
  @Input() list!: List;
  @Input() disabled!: boolean;
  @Input() openModal!: boolean;
  listForm: FormGroup;
  wordList: Character[]=[];
  deletedWordList: Character[]=[];
  latestCardName: string='';
  data:any;
  isDisabledList=true;
  isDisabledCard=true;
  showModal=false;

  constructor(private readonly fb: FormBuilder, private readonly store: Store<AppState>, private readonly characterService: CharacterService,
    private readonly ms: ModalService) {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      cardName: ['', [Validators.required, Validators.minLength(1)]],
      words: ['', [Validators.required, Validators.minLength(1)]]
    })
  }
  ngAfterViewInit(): void {
    this.ms.showModal$.subscribe(show=>{
      if(this.header==='Update'){
        this.listForm.get('name')?.disable();
      this.listForm.get('cardName')?.disable();
      this.listForm.get('name')?.setValue(decodeURIComponent(this.listForm.get('name')?.value));
      this.listForm.get('cardName')?.setValue(decodeURIComponent(this.listForm.get('cardName')?.value));
      }
      
    })
  }
  
  
  
  
  ngOnChanges(changes: SimpleChanges): void {
    if(this.list){
      this.wordList=[...this.list.characters];
    }
    if(this.nameWithSpaces){
      this.listForm.patchValue({
        name: this.nameWithSpaces,
        //characters: this.list.characters.map(c => c.value).join('')
      });
    }
    
  }

  ngOnInit(): void {
      this.wordList=[...this.list?.characters];

    this.listForm.patchValue({
      //name: this.nameWithSpaces,
      cardName: this.list?.cardname,
      //characters: this.list.characters.map(c => c.value).join('')
    });
    this.store.select(selectListDataWithCards).pipe(take(1)).subscribe((res:any)=>{
      if(res && this.listName){
        this.data = res[this.listName];
      }
    })
    
    
  }

  get name() {
    return this.list.cardname
  }

  get words(){
    return this.listForm.get('words')
  }

  get cardName(){
    return this.listForm.get('cardName')
  }

  
  onModalOpen(event: Event){
    console.log(event);
  }

  removeFromList(index: number){
    this.wordList.splice(index,1)
  }

  addCard(cardname: string){
    this.latestCardName = cardname;
  }

  addToWordsList(item: AbstractControl | null) {
    if (item !== null) {
    const character={value: item.value.split(" ").join(""), active: false};
      if(this.header==='Create'){
        this.wordList.push(character);
      }
      else{
        this.wordList=[...this.wordList, character]
      }
      
    }

  }

  onEditList(){
    this.listForm.get('name')?.enable();
    this.listInputBox.nativeElement.focus();
  }

  onEditCard(){
    this.listForm.get('cardName')?.enable();
    this.cardInputBox.nativeElement.focus();
  }


  onSubmit(): void {
     this.deletedWordList= this.list.characters.filter(c=> !this.wordList.find(item=> item.value===c.value));
    let card:List = {
            //cardname: this.listForm.get('cardName')?.value.split(" ").join(""),
            cardname: encodeURIComponent(this.listForm.get('cardName')?.value),
            characters: this.wordList,
            selected: false
    };
    let values:any = {};
    values[card.cardname]=card;
    if (this.header === 'Create') {

      const final:ListData={
        nameWithoutSpaces: this.listForm.get('name')?.value.split(" ").join(""),
        nameWithSpaces: this.listForm.get('name')?.value,
        values
      
      }
      this.store.dispatch(addWordList({listName: this.listForm.get('name')?.value, cardName: card.cardname, characters: card.characters}));
      //this.store.dispatch(reschuffleList({list:final}));
    }
    else{
      let dataref = {
        ...this.data.values
      };
      delete dataref[this.list.cardname];
      values={
        ...dataref, ...values
      }
      const final: ListData = {
        nameWithoutSpaces: this.listForm.get('name')?.value.split(" ").join(""),
        nameWithSpaces: this.listForm.get('name')?.value,
        values
        // ...this.list,
        // characters: this.wordList,
      }
      if(this.deletedWordList.length>0){
        this.store.dispatch(updateWordList({listName: this.listForm.get('name')?.value, listId: this.data.listId, cardName: card.cardname, cardId: this.list.cardId as any, characters: card.characters, deletedCharacters: this.deletedWordList}));
      }
      else{
        this.store.dispatch(updateWordList({listName: this.listForm.get('name')?.value, listId: this.data.listId, cardName: card.cardname, cardId: this.list.cardId as any, characters: card.characters}));
      }
      //this.store.dispatch(reschuffleList({list:final}));
    }
  }

}
