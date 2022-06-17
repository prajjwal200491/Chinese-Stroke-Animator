import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { loadCharacter, loadCharacterDecomposition, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, reschuffleList, saveReschuffledList, setActiveCharacterList, loadRelatedWords, loadRelatedWordsEnded } from "./app.actions";
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from "./app.state";
import { selectLatestCharacter, selectCustomListData } from "./app.selector";
import { CharacterService } from "../character.service";
import { Character, List } from "./app.model";


@Injectable()
export class AppEffects {

    loadCharacter$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadCharacter),
            map(({ id, text, properties }) => {
                return this.characterService.loadCharacter(id, text, properties)
            })
        )
    },
        { dispatch: false });

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
                this.characterService.updateCharacter(character)
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
                    let character = res.dictionary.find((d: any) => d.character === latest);
                    return loadCharacterDecompositionEnded({ decomposition: character.decomposition })
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
                    let character = res.dictionary.find((d: any) => d.character === latest);
                    return loadRelatedWordsEnded({ relatedWords: character.definition })
                })
            ))
        );
    },
    );

    refresh$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(searchCharacter, updateCharacter),
            map(() => loadCharacterDecomposition())
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