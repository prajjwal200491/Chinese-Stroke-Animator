import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addNewList, updateList } from 'src/app/state/app.actions';
import { List } from 'src/app/state/app.model';
import { AppState } from 'src/app/state/app.state';

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

  constructor(private readonly fb: FormBuilder, private readonly store: Store<AppState>) {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      characters: [[''], [Validators.required, Validators.minLength(1)]]
    })
  }

  ngOnInit(): void {
    this.listForm.patchValue({
      name: this.list?.name,
      characters: this.list.characters.map(c => c.value).join('')
    })
  }

  get name() {
    return this.list.name
  }

  get characters() {
    return this.listForm.get('characters')
  }


  onSubmit(): void {
    if (this.header === 'Create') {
     const characters= this.listForm.get('characters')?.value.split('').map((item:string)=>{
        return {
          value: item,
          active: false
        }
      })
      const final:List={
        name: this.listForm.get('name')?.value,
        characters: characters,
        selected: false
      }
      this.store.dispatch(addNewList({ list: final }))
    }
    else{
      const characters= this.listForm.get('characters')?.value.split('').map((item:string)=>{
        return {
          value: item,
          active: false
        }
      })
      //const chStrAr = this.listForm.get('characters')?.value.split('');
      const final: List = {
        ...this.list,
        characters: characters
      }
      this.store.dispatch(updateList({ list: final }));
    }

    //this.header === 'Create' ? this.store.dispatch(addNewList({ list: final })) : this.store.dispatch(updateList({ list: final }));
  }

}
