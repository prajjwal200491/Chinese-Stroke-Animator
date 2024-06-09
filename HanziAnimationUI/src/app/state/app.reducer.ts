import { createReducer, on } from "@ngrx/store";
import { addNewList, loadCharacterDecompositionEnded, loadCharacterEnded, searchCharacter, updateCharacter, updateList, saveReschuffledList, setActiveCharacterList, loadRelatedWordsEnded, resetGroupWriter, saveGroupDecomposition, saveGroupRelatedWords, loadWordsListEnded, loadWordsListDataEnded, setAllCardsInactive, moveListToTopEnded, shouldSelectList, setAllListsInactiveOnSearch, setChineseCharacterTickValue } from "./app.actions";
import { AppState } from "./app.state";
import { List, ListData } from "./app.model";

export const initialState: AppState = {
    search: '',
    recentlyTyped: [''],
    decomposition: '',
    character: '',
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
    groupCharactersRelatedWords: [],
    chineseCharactersList:[]
    
}

export const appReducer = createReducer(
  initialState,
  on(
    searchCharacter,
    (state: AppState, operationResult): AppState => ({
      ...state,
      search: operationResult.search,
      recentlyTyped: [...state.recentlyTyped, operationResult.search],
      character: operationResult.search,
    })
  ),

  on(
    updateCharacter,
    (state: AppState, operationResult): AppState => ({
      ...state,
      character: operationResult.character,
    })
  ),

  on(
    loadCharacterDecompositionEnded,
    (state: AppState, operationResult): AppState => ({
      ...state,
      decomposition: operationResult.decomposition,
    })
  ),

  on(
    loadRelatedWordsEnded,
    (state: AppState, operationResult): AppState => ({
      ...state,
      relatedWords: operationResult.relatedWords,
    })
  ),

  on(
    saveGroupDecomposition,
    (state: AppState, operationResult): AppState => ({
      ...state,
      groupCharactersDecomposition: operationResult.group,
    })
  ),

  on(
    saveGroupRelatedWords,
    (state: AppState, operationResult): AppState => ({
      ...state,
      groupCharactersRelatedWords: operationResult.group,
    })
  ),

  on(
    resetGroupWriter,
    (state: AppState): AppState => ({
      ...state,
      groupWriters: [],
    })
  ),

  on(
    loadCharacterEnded,
    (state: AppState, { writer, isGroup }): AppState => ({
      ...state,
      //writer: writer,
      groupWriters: isGroup ? [...state.groupWriters, writer] : [],
    })
  ),

  on(
    addNewList,
    (state: AppState, operationResult): AppState => ({
      ...state,
      list: [...state.list, operationResult.list],
    })
  ),

  on(
    loadWordsListEnded,
    (state: AppState, operationResult): AppState => ({
      ...state,
      list: operationResult.lists,
      listIds: operationResult.listIds,
    })
  ),

  on(
    loadWordsListDataEnded,
    (state: AppState, operationResult): AppState => ({
      ...state,
      listData: operationResult.listData,
    })
  ),
  on(
    setChineseCharacterTickValue,
    (state: AppState, {chineseCharacter}): AppState => {
      const existingIndex = state.chineseCharactersList.findIndex(item => item.value === chineseCharacter.value);

    if (existingIndex === -1) {
      // If the object does not exist in the array, add it
      return {
        ...state,
        chineseCharactersList: [...state.chineseCharactersList, chineseCharacter]
      };
    } else {
      // If the object exists, update it
      const updatedItems = state.chineseCharactersList.map((item, index) =>
        index === existingIndex ? { ...item, ...chineseCharacter } : item
      );
      return {
        ...state,
        chineseCharactersList: updatedItems
      };
    }
    }
  ),

  on(
    saveReschuffledList,
    (state: AppState, operationResult): AppState => ({
      ...state,
      list: operationResult.list,
    })
  ),

  on(
    moveListToTopEnded,
    (state: AppState, operationResult): AppState => ({
      ...state,
      listData: operationResult.list,
    })
  ),

  on(
    shouldSelectList,
    (state: AppState, operationResult): AppState => {
      const updatedListData = { ...state.listData };
      for(const name in updatedListData){
        if(updatedListData.hasOwnProperty(name)){
          if(name===operationResult.listname){
            updatedListData[name] = {
              ...updatedListData[name],
              isSelectedList: true
            }
          }
          else{
            updatedListData[name] = {
              ...updatedListData[name],
              isSelectedList: false
            }
          }
        }
      }
      return {
        ...state,
        listData: updatedListData
      }
    }
  ),

  on(setActiveCharacterList, (state: AppState, { listName, cardName, character }): AppState => {
    // Create new copies of the objects to ensure immutability
    const updatedListData = { ...state.listData };
    const list = updatedListData[listName];
    if (list && list.values && list.values[cardName]) {
        const updatedCard = { ...list.values[cardName] };

        updatedCard.characters = (updatedCard.characters || []).map(c => {
            if (c.value === character.value) {
                return {
                    ...c,
                    active: true
                };
            } else {
                return {
                    ...c,
                    active: false
                };
            }
        });

        updatedCard.selected = true;
        updatedListData[listName]={
          listname: updatedListData[listName].listname,
          //nameWithSpaces: updatedListData[listName].nameWithSpaces,
          values:{
            ...updatedListData[listName].values,
            [cardName]: updatedCard,
          },
          listId: updatedListData[listName].listId,
          isSelectedList: updatedListData[listName].isSelectedList
        }
    }

    return {
        ...state,
        listData: updatedListData,
    };
}),

on(setAllListsInactiveOnSearch, (state: AppState): AppState=>{
   // Create a new copy of the state with all cards set to inactive
   const updatedListData = { ...state.listData };

   for (const lname in updatedListData) {
     if (updatedListData.hasOwnProperty(lname)) {
      const list = updatedListData[lname];
      if (list && list.values) {
        for (const cname in list.values) {
          const updatedCard = { ...list.values[cname] };
          if (list.values.hasOwnProperty(cname)) {
            updatedCard.characters = (updatedCard.characters || []).map(c => ({
                ...c,
                active: false
              }));
              updatedCard.selected = false;
              updatedListData[lname] = {
                listname: updatedListData[lname].listname,
                //nameWithSpaces: updatedListData[lname].nameWithSpaces,
                values: {
                  ...updatedListData[lname].values,
                  [cname]: updatedCard,
                },
              };
          }
        }
      }
     }
    }
    return {
      ...state,
      listData: updatedListData,
    };
}),

on(setAllCardsInactive, (state: AppState, { listName, cardName, character }): AppState => {
  // Create a new copy of the state with all cards set to inactive
  const updatedListData = { ...state.listData };

  for (const lname in updatedListData) {
    if (updatedListData.hasOwnProperty(lname)) {
      if(lname===listName){
      const list = updatedListData[lname];
      if (list && list.values) {
        for (const cname in list.values) {
          const updatedCard = { ...list.values[cname] };
          if (list.values.hasOwnProperty(cname)) {
            if(cname===cardName){
            updatedCard.characters = (updatedCard.characters || []).map(c => {
              if (c.value === character.value) {
                return {
                    ...c,
                    active: character.active
                };
            } else {
                return {
                    ...c,
                    active: false
                };
            }
            }
            );
            //updatedCard.selected = false;
              updatedListData[lname] = {
                listname: updatedListData[lname].listname,
                listId: updatedListData[lname].listId,
                isSelectedList: updatedListData[lname].isSelectedList,
                //nameWithSpaces: updatedListData[lname].nameWithSpaces,
                values: {
                  ...updatedListData[lname].values,
                  [cname]: updatedCard,
                },
              };
          }
          else{
            updatedCard.characters = (updatedCard.characters || []).map(c => ({
              ...c,
              active: false
            }));
            updatedCard.selected = false;
              updatedListData[lname] = {
                listname: updatedListData[lname].listname,
                listId: updatedListData[lname].listId,
                isSelectedList: updatedListData[lname].isSelectedList,
                //nameWithSpaces: updatedListData[lname].nameWithSpaces,
                values: {
                  ...updatedListData[lname].values,
                  [cname]: updatedCard,
                },
              };
          }
          }
        }
      }
    }
    else{
      const list = updatedListData[lname];
      if (list && list.values) {
        for (const cname in list.values) {
          const updatedCard = { ...list.values[cname] };
          if (list.values.hasOwnProperty(cname)) {
            updatedCard.characters = (updatedCard.characters || []).map(c => ({
                ...c,
                active: false
              }));
              updatedCard.selected = false;
              updatedListData[lname] = {
                listname: updatedListData[lname].listname,
                listId: updatedListData[lname].listId,
                isSelectedList: updatedListData[lname].isSelectedList,
                //nameWithSpaces: updatedListData[lname].nameWithSpaces,
                values: {
                  ...updatedListData[lname].values,
                  [cname]: updatedCard,
                },
              };
          }
        }
      }

    }
    }
  }

  return {
    ...state,
    listData: updatedListData,
  };
}),

  
  on(
    updateList,
    (state: AppState, operationResult): AppState => ({
      ...state,
      list: state.list.map((content) =>
        content.cardname === operationResult.list.cardname
          ? { ...content, characters: operationResult.list.characters }
          : content
      ),
    })
  )
);
