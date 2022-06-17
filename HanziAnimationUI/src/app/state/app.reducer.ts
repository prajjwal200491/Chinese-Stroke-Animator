import { createReducer, on } from "@ngrx/store";
import { isTemplateExpression } from "typescript";
import { addNewList, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, updateList, saveReschuffledList, setActiveCharacterList, loadRelatedWordsEnded } from "./app.actions";
import { AppState } from "./app.state";

export const initialState: AppState = {
    search: '開',
    recentlyTyped: ['開'],
    decomposition: '',
    character: '開',
    list: [
        {name: 'Fruits', characters: [{ value: '開', active: false }, { value: '都', active: false }, { value: '夏', active: false }, { value: '好', active: false }, { value: '好', active: false }, { value: '笑', active: false }, { value: '夏', active: false }, { value: '夏', active: false }, { value: '夏', active: false }, { value: '都', active: false }, { value: '都', active: false }, { value: '好', active: false }, { value: '好', active: false }, { value: '好', active: false }, { value: '都', active: false }, { value: '好', active: false }],selected: false},
        { name: 'Veggies', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false},{value: '好', active: false}],selected: false},
        { name: 'toys', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false},
        { name: 'sports', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false},
    ],
    relatedWords: ''
    
}

export const appReducer = createReducer(
    initialState,
    on(searchCharacter, (state: AppState, operationResult): AppState => (
        {
            ...state,
            search: operationResult.search,
            recentlyTyped: [
                ...state.recentlyTyped,
                operationResult.search
            ],
            character: operationResult.search
        }
    )),
    
    on(updateCharacter, (state: AppState, operationResult): AppState => (
        {
            ...state,
            character: operationResult.character
        }
    )),

    on(loadCharacterDecompositionEnded, (state: AppState, operationResult): AppState => (
        {
            ...state,
            decomposition: operationResult.decomposition
        }
    )),

    on(loadRelatedWordsEnded, (state: AppState, operationResult): AppState => (
        {
            ...state,
            relatedWords: operationResult.relatedWords
        }
    )),

    on(loadCharacterEnded, (state: AppState, operationResult): AppState => (
        {
            ...state,
            writer: operationResult.writer
        }
    )),

    on(addNewList, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list: [...state.list, operationResult.list]
        }
    )),
    on(saveReschuffledList, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list: operationResult.list
        }
    )),
    on(setActiveCharacterList, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list:state.list.map(item=> {
                if(item.name===operationResult.listName){
                    return {
                        ...item,
                        characters: item.characters.map(character=> {
                            if(character.value===operationResult.character.value){
                                return {
                                    ...character,
                                    active: true
                                }
                            }
                            else{
                                return {
                                    ...character,
                                    active:false
                                }
                            }
                            
                        }),
                        selected: true
                    }
                }
                else{
                    return {
                        ...item,
                        characters: item.characters.map(character=>{
                            return{
                                ...character,
                                active: false
                            }
                        }),
                        selected: false
                    }
                }
            })
        }
    )),
    on(updateList, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list: state.list.map(content=> content.name===operationResult.list.name ? {...content, characters: operationResult.list.characters}: content)
        }
    ))
)
