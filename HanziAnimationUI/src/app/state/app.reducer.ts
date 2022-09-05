import { createReducer, on } from "@ngrx/store";
import { addNewList, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, updateList, saveReschuffledList, setActiveCharacterList, loadRelatedWordsEnded, resetGroupWriter, saveGroupDecomposition, saveGroupRelatedWords, loadWordsListEnded } from "./app.actions";
import { AppState } from "./app.state";

export const initialState: AppState = {
    search: '開',
    recentlyTyped: ['開'],
    decomposition: '',
    character: '開',
    testList:[],
    listIds: [],
    list: [
        // {name: 'Fruits', characters: [{ value: '開', active: false }, { value: '都', active: false }, { value: '夏', active: false }, { value: '馬鈴薯', active: false }, { value: '夏天', active: false }],selected: false},
        // { name: 'Veggies', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false},
        // { name: 'toys', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false},
        // { name: 'sports', characters: [{value: '開', active: false},{value: '都', active: false},{value: '夏', active: false},{value: '好', active: false}],selected: false},
    ],
    relatedWords: '',
    groupWriters: [],
    groupCharactersDecomposition: [],
    groupCharactersRelatedWords: []
    
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

    on(saveGroupDecomposition, (state: AppState, operationResult): AppState => (
        {
            ...state,
            groupCharactersDecomposition: operationResult.group
        }
    )),

    on(saveGroupRelatedWords, (state: AppState, operationResult): AppState => (
        {
            ...state,
            groupCharactersRelatedWords: operationResult.group
                
        }
    )),

    on(resetGroupWriter, (state: AppState): AppState => (
        {
            ...state,
            groupWriters: []
        }
    )),

    on(loadCharacterEnded, (state: AppState, {writer, isGroup}): AppState => (
        {
            ...state,
            //writer: writer,
            groupWriters: isGroup? [...state.groupWriters, writer]: []
        }
    )),

    on(addNewList, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list: [...state.list, operationResult.list]
        }
    )),

    on(loadWordsListEnded, (state: AppState, operationResult): AppState => (
        {
            ...state,
            list: operationResult.lists,
            listIds: operationResult.listIds
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
