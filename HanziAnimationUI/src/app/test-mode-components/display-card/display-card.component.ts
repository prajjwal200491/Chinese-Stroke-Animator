import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { CharacterList } from '../test-mode-list/test-mode-list.component';
import { loadRelatedWords, updateCharacter } from 'src/app/state/app.actions';
import { DictionaryService } from 'src/app/dictionary.service';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayCardComponent implements OnInit, OnChanges {
  @Input() character!: CharacterList;
  @Input() index!: number;
  @Input() revealPinyins: boolean = false;
  @Output() onTestModeCharacterClick = new EventEmitter();
  isTick = false;
  pinyins: string[] = [];

  constructor(
    private readonly store: Store,
    private readonly dictionary: DictionaryService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.character?.currentValue) {
      // `revealPinyins` is deliberately NOT reset here -- it is an @Input owned
      // by the parent, and overwriting it made the Pinyin button appear dead.
      this.isTick = this.character.characterValues.every((item) => item.isTicked);

      const characters: string[] = changes.character.currentValue.characterValues.map(
        (c: any) => c.value
      );
      // One cached lookup for the whole word rather than a 4 MB fetch per glyph,
      // and resolved positionally so the readings cannot arrive out of order or
      // accumulate across renders.
      this.pinyins = [];
      this.dictionary.getPinyinForEach(characters).subscribe((readings) => {
        this.pinyins = readings;
        this.cdr.markForCheck(); // OnPush: this lands outside a template event
      });
    }
  }

  onCharacterClick(character: string) {
    this.store.dispatch(updateCharacter({ character: character }));
    this.store.dispatch(loadRelatedWords({}));
    this.onTestModeCharacterClick.emit(character);
  }

  speak(character: string): void {
    this.dictionary.speak(character);
  }
}
