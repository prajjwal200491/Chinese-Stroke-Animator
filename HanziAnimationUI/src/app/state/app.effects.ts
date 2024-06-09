import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { loadCharacter, loadCharacterDecomposition, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, reschuffleList, saveReschuffledList, loadWordsList, loadRelatedWords, loadRelatedWordsEnded, saveGroupDecomposition, saveGroupRelatedWords, loadWordsListEnded, addWordList, updateWordList, loadWordsListDataEnded, setActiveCharacterList, setAllCardsInactive, moveListToTop, moveListToTopEnded, loadWordsListData } from "./app.actions";
import { flatMap, map, mergeMap, switchMap, tap, withLatestFrom, first, filter } from 'rxjs/operators';
import { AppState, Decomposition, GroupCharacter } from "./app.state";
import { selectLatestCharacter, selectCustomListData, selectListDataWithCards } from "./app.selector";
import { CharacterService } from "../character.service";
import { Character, List, ListData } from "./app.model";
import HanziWriter from "hanzi-writer";
import { of } from "rxjs";
import { ref } from "@angular/fire/database";


@Injectable()
export class AppEffects {
  writer!: string;
  group: boolean = false;
  loadCharacter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCharacter),
      withLatestFrom(this.store$.select(selectLatestCharacter)),
      tap(([{ id, text, properties }, latestCharacter]) => {
        this.group = latestCharacter.length > 1;
        const writer = this.characterService.loadCharacter(
          id,
          text,
          properties
        );
        this.writer = JSON.stringify(writer);
        return writer;
      }),
      map(() => {
        return loadCharacterEnded({ writer: this.writer, isGroup: this.group });
      })
    );
  });

  loadWordsList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadWordsList),
      mergeMap(() =>
        this.characterService.getList().pipe(
          map((lists) => {
            return loadWordsListEnded({
              lists: Object.values(lists),
              listIds: Object.keys(lists),
            });
          })
        )
      )
    );
  });

  loadWordsListData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadWordsList),
      mergeMap(() =>
        this.characterService.getListData().pipe(
          map((lists) => {
            return loadWordsListDataEnded({ listData: lists });
          })
        )
      )
    );
  });

  addWordList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addWordList),
      switchMap(({ listName, cardName, characters }) =>{
        characters= characters.map(c=>{
          return {
            active: c.active,
            characterName: c.value,
            characterValue: c.value
          }
        })
        return this.characterService
          .saveListData(listName, cardName, characters)
          .pipe(map(() => loadWordsList()))
      }
      )
    );
  });

  updateWordList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateWordList),
      switchMap(({ listName, cardName,cardId, listId, characters, deletedCharacters }) =>{
        characters= characters.map(c=>{
          return {
            active: c.active,
            characterName: c.value,
            characterValue: c.value
          }
        })
        if(deletedCharacters && deletedCharacters.length>0){
          deletedCharacters= deletedCharacters?.map(c=>{
            return {
              active: c.active,
              characterName: c.value,
              characterValue: c.value
            }
          })
        }
        
        return this.characterService
          .updateListData(listName, listId, cardId, cardName, characters, deletedCharacters)
          .pipe(map(() => loadWordsList()))

      }
        
      )
    );
  });

  //  updateWordList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //         ofType(updateWordList),
  //         withLatestFrom(this.store$.select(selectCustomListData)),
  //         mergeMap(([{list},allLists])=> this.characterService.saveList(list).pipe(
  //             map(()=> loadWordsList())
  //         ))
  //     )
  // }
  //  );

  reschuffleList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(reschuffleList),
      withLatestFrom(this.store$.select(selectCustomListData)),
      map(([{ list }, allList]) => {
        let copyList = [...allList];
        const reschuffledList = this.moveItem(copyList, list);
        return saveReschuffledList({ list: reschuffledList });
      })
    );
  });

  moveListToTop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(moveListToTop),
      withLatestFrom(this.store$.select(selectListDataWithCards)),
      map(([{ listname }, list]) => {
        if (list) {
          const keys = Object.keys(list);
          const reorderedKeys = this.reorderKeys(listname, keys);
          //this.reorderArray(listname, list);
          const newObj: ListData = {};
          for (const k of reorderedKeys) {
            newObj[k] = list[k];
          }
          return moveListToTopEnded({ list: newObj });
        }
        return { type: 'NoDispatch' };
      })
    );
  });

      saveListData$ = createEffect(() => {
          return this.actions$.pipe(
              ofType(moveListToTopEnded),
              map(({list})=> {
                  this.characterService.saveListChanges(list)
              }
              )
          )
      },
      {dispatch:false}
  );
  //     setActiveCharacterList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //         ofType(setActiveCharacterList),
  //         withLatestFrom(this.store$.select(selectCustomListData)),
  //         map(([{character, listName}, allList]) => {
  //             const newList=this.setActiveCharacterList(listName, character, allList)
  //             return saveReschuffledList({list: newList})
  //         })
  //     )
  // },
  //     );

  updateCharacter$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(updateCharacter),
        map(({ character }) => {
          return (
            character.length === 1 &&
            this.characterService.updateCharacter(character)
          );
        })
      );
    },
    { dispatch: false }
  );

  loadCharacterDecomposition$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCharacterDecomposition),
      withLatestFrom(this.store$.select(selectLatestCharacter)),
      switchMap(([characterToDecompose, latest]) =>
        this.http.get('assets/dictionary.json').pipe(
          map((res: any) => {
            if (latest.length > 1 || characterToDecompose.character) {
              let groupChar: GroupCharacter[] = [];
              const result = (latest!=='') ? latest : characterToDecompose.character;
              result?.split('').forEach((item: string) => {
                let d = res.dictionary.find((d: any) => d.character === item);
                groupChar.push({
                  character: item,
                  decomposition: d.decomposition,
                });
              });
              return saveGroupDecomposition({ group: groupChar });
            } else {
              let result = res.dictionary.find(
                (d: any) => d.character === latest
              );
              return loadCharacterDecompositionEnded({
                decomposition: result.decomposition,
              });
            }
          })
        )
      )
    );
  });
  loadRelatedWords$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadRelatedWords),
      withLatestFrom(this.store$.select(selectLatestCharacter)),
      switchMap(([relatedWords, latest]) =>
        this.http.get('assets/dictionary.json').pipe(
          map((res: any) => {
            if (latest.length > 1 || relatedWords.character) {
              let groupChar: GroupCharacter[] = [];
              const result = (latest!=='') ? latest : relatedWords.character;
              result?.split('').forEach((item: string) => {
                let d = res.dictionary.find((d: any) => d.character === item);
                groupChar.push({ character: item, relatedWords: d.definition });
              });
              return saveGroupRelatedWords({ group: groupChar });
            } else {
              let result = res.dictionary.find(
                (d: any) => d.character === latest
              );
              return loadRelatedWordsEnded({ relatedWords: result.definition });
            }
          })
        )
      )
    );
  });

  refresh$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(searchCharacter, updateCharacter),
      map(() => loadCharacterDecomposition({}))
    );
  });

  setAllCardsInactive$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setActiveCharacterList),
      map(({ cardName, character, listName }) =>
        setAllCardsInactive({ cardName, character, listName })
      )
    );
  });

  moveItem(allList: List[], list: List) {
    allList.forEach((item, index) => {
      if (item.cardname === list.cardname) {
        allList.splice(index, 1);
        allList.splice(0, 0, list);
      }
    });
    return allList;
  }

  reorderKeys(name: string, keys: string[]) {
    const index = keys.indexOf(name);
    keys.splice(index, 1);
    keys.unshift(name);
    return keys;
  }

  reorderArray(listname: string, list: ListData) {
    const keyValueArray = [];

    for (const key in list) {
      if (list.hasOwnProperty(key)) {
        const value = list[key];
        keyValueArray.push({ key, value });
      }
    }
    let index; let indexValue;
    keyValueArray.forEach((item,i)=>{
        if(item.key===listname){
            index=i;
            indexValue=item;
        }
    });
    if(index){
        keyValueArray.splice(index,1);
        keyValueArray.unshift(indexValue);
        console.log(keyValueArray);
        const reconstructedListData: { [key: string]: any } = {};
        if(keyValueArray.length>0){
            keyValueArray.forEach(item=>{
                if(item){
                reconstructedListData[item.key]=item?.value;
                }
            })
            console.log(reconstructedListData);
        }
        
    }

  }

  //   setActive(item:List, character: Character){
  //     item.characters.map(c=>{
  //         if(c.value===character.value){
  //             return {
  //                 value: character.value,
  //                 active: character.active
  //             }
  //         }
  //         else{
  //             return {
  //                 value: c.value,
  //                 active: false
  //             }
  //         }
  //     })
  //   }

  //   setInactive(listname: string, allList: List[]){
  //     allList.map(item=>{
  //         if(item.name!===listname)
  //     })
  //   }

  constructor(
    private readonly actions$: Actions,
    private readonly http: HttpClient,
    private readonly store$: Store<AppState>,
    private readonly characterService: CharacterService
  ) {}
}