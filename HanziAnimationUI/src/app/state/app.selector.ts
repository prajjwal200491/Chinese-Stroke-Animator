import { createSelector } from "@ngrx/store";
import { AppState, selectAppState } from "./app.state";


export const selectLatestCharacter = createSelector(selectAppState, (state: AppState)=> state.character);
export const selectRecentlyTypedCharacters = createSelector(selectAppState, (state: AppState)=> state.recentlyTyped);
export const selectCharacterDecomposition = createSelector(selectAppState, (state: AppState)=> state.decomposition);
export const selectRelatedWords = createSelector(selectAppState, (state: AppState)=> state.relatedWords);
export const selectHanziCharacterData = createSelector(selectAppState, (state: AppState)=> state.writer);
export const selectCustomListData = createSelector(selectAppState, (state: AppState)=> state.list);
export const selectFourCustomListData = createSelector(selectAppState, (state: AppState)=> state.list.slice(0,4));