import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { loadCharacter, loadCharacterDecomposition, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, reschuffleList, saveReschuffledList, loadWordsList, loadRelatedWords, loadRelatedWordsEnded, saveGroupDecomposition, saveGroupRelatedWords, loadWordsListEnded, addWordList, updateWordList } from "./app.actions";
import { flatMap, map, mergeMap, switchMap, tap, withLatestFrom, first } from 'rxjs/operators';
import { AppState, Decomposition, GroupCharacter } from "./app.state";
import { selectLatestCharacter, selectCustomListData } from "./app.selector";
import { CharacterService } from "../character.service";
import { Character, List } from "./app.model";
import HanziWriter from "hanzi-writer";
import { of } from "rxjs";
import { ref } from "@angular/fire/database";


@Injectable()
export class AppEffects {
    writer!:string;
    group:boolean=false;
    loadCharacter$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadCharacter),
            withLatestFrom(this.store$.select(selectLatestCharacter)),
            tap(([{ id, text, properties }, latestCharacter]) => {
                this.group= latestCharacter.length>1
                const writer=this.characterService.loadCharacter(id, text, properties);
                this.writer= JSON.stringify(writer);
                return writer;
            }),
            map(()=> {
                
                return loadCharacterEnded({writer: this.writer, isGroup: this.group})
            })
        )
    },
     );

    loadWordsList$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadWordsList),
            mergeMap(()=> this.characterService.getList().pipe(
                map(lists=>{
                    return loadWordsListEnded({lists: Object.values(lists), listIds: Object.keys(lists)});
                })
            ))
        )
    }
     );

     addWordList$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(addWordList),
            switchMap(({list})=> this.characterService.saveList(list).pipe(
                map(()=> loadWordsList())
            )
            )
        )
    }
     );

     updateWordList$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(updateWordList),
            switchMap(({list})=> this.characterService.updateList(list).pipe(
                map(()=> loadWordsList())
            )
            )
        )
    }
     );

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
            map(([{list}, allList]) => {
                let copyList = [...allList];
                const reschuffledList=this.moveItem(copyList, list);
                return saveReschuffledList({list: reschuffledList})
            })
        )
    },
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

    updateCharacter$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(updateCharacter),
            map(({ character }) => {
                return character.length===1 && this.characterService.updateCharacter(character)
            })
        )
    },
        { dispatch: false });

    loadCharacterDecomposition$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadCharacterDecomposition),
            withLatestFrom(this.store$.select(selectLatestCharacter)),
            switchMap(([, latest]) => this.http.get("assets/dictionary.json").pipe(
                map((res: any) => {
                    if(latest.length>1){
                        let groupChar: GroupCharacter[]=[];
                        latest.split('').forEach((item:string)=>{
                           let d= res.dictionary.find((d: any) => d.character === item);
                           groupChar.push({character: item, decomposition: d.decomposition})
                        })
                        return saveGroupDecomposition({group: groupChar})
                    }
                    else{
                        let result = res.dictionary.find((d: any) => d.character === latest);
                        return loadCharacterDecompositionEnded({ decomposition: result.decomposition });
                    }
                    
                })
            ))
        );
    },
    );
    loadRelatedWords$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadRelatedWords),
            withLatestFrom(this.store$.select(selectLatestCharacter)),
            switchMap(([, latest]) => this.http.get("assets/dictionary.json").pipe(
                map((res: any) => {
                    if(latest.length>1){
                        let groupChar: GroupCharacter[]=[];
                        latest.split('').forEach((item:string)=>{
                           let d= res.dictionary.find((d: any) => d.character === item);
                           groupChar.push({character: item, relatedWords: d.definition})
                        })
                        return saveGroupRelatedWords({group: groupChar})
                    }
                    else{
                        let result = res.dictionary.find((d: any) => d.character === latest);
                        return loadRelatedWordsEnded({ relatedWords: result.definition });
                    }
                    
                })
            ))
        );
    },
    );

    refresh$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(searchCharacter, updateCharacter),
            map(() => loadCharacterDecomposition({}))
        )
    });

    moveItem(allList: List[], list: List){
        allList.forEach((item,index)=>{
          if(item.name===list.name){
            allList.splice(index,1);
            allList.splice(0,0,list);
          }
        })
        return allList;
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
    ) { }
}