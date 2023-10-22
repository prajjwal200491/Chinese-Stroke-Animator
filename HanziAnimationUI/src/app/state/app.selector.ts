import { createSelector } from "@ngrx/store";
import { AppState, selectAppState } from "./app.state";


export const selectLatestCharacter = createSelector(selectAppState, (state: AppState)=> state.character);
export const selectWriter = createSelector(selectAppState, (state: AppState)=> state.writer);
export const selectGroupWriters = createSelector(selectAppState, (state: AppState)=> state.groupWriters);
export const selectRecentlyTypedCharacters = createSelector(selectAppState, (state: AppState)=> state.recentlyTyped);
export const selectCharacterDecomposition = createSelector(selectAppState, (state: AppState)=> state.decomposition);
export const selectGroupDecomposition = createSelector(selectAppState, (state: AppState, props:{character: string})=> state.groupCharactersDecomposition.find(item=> item.character===props.character));
export const selectRelatedWords = createSelector(selectAppState, (state: AppState)=> state.relatedWords);
export const selectGroupRelatedWords = createSelector(selectAppState, (state: AppState, props:{character: string})=> state.groupCharactersRelatedWords.find(item=> item.character===props.character)?.relatedWords);
export const selectHanziCharacterData = createSelector(selectAppState, (state: AppState)=> state.writer);
export const selectCustomListData = createSelector(selectAppState, (state: AppState)=> state.list);
export const selectFourCustomListData = createSelector(selectAppState, (state: AppState)=> state.list);
export const selectListDataWithCards = createSelector(selectAppState, (state: AppState)=> state.listData);