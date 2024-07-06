import { createSelector } from "@ngrx/store";
import { AppState, selectAppState } from "./app.state";


export const selectLatestCharacter = createSelector(selectAppState, (state: AppState)=> state.character);
export const selectWriter = createSelector(selectAppState, (state: AppState)=> state.writer);
export const selectGroupWriters = createSelector(selectAppState, (state: AppState)=> state.groupWriters);
export const selectRecentlyTypedCharacters = createSelector(selectAppState, (state: AppState)=> state.recentlyTyped);
export const selectCharacterDecomposition = createSelector(selectAppState, (state: AppState)=> state.decomposition);
export const selectGroupDecomposition = createSelector(selectAppState, (state: AppState, props:{character: string})=> {
    return state.groupCharactersDecomposition.find(item=> item.character===props.character)
});
export const selectRelatedWords = createSelector(selectAppState, (state: AppState)=> state.relatedWords);
export const selectGroupRelatedWords = createSelector(selectAppState, (state: AppState, props:{character: string})=> state.groupCharactersRelatedWords.find(item=> item.character===props.character)?.relatedWords);
export const selectHanziCharacterData = createSelector(selectAppState, (state: AppState)=> state.writer);
export const selectCustomListData = createSelector(selectAppState, (state: AppState)=> state.list);
export const selectFourCustomListData = createSelector(selectAppState, (state: AppState)=> state.list);
export const selectListDataWithCards = createSelector(selectAppState, (state: AppState)=> state.listData);
export const selectIsSelectedList = createSelector(selectAppState, (state: AppState)=> {
    if(state.listData){
        const list = Object.values(state.listData);
        const result =list.find(l=> l.isSelectedList);
        return result?.listId;
    }
    return undefined;

});
export const selectIsActiveCharacter = createSelector(selectAppState, (state: AppState)=> {
    let activeCharacter=undefined;
    if(state.listData){
        const list = Object.values(state.listData);
        list.forEach(l=>{
            const cards=Object.values(l.values);
            cards.forEach(card=>{
                const character = card.characters.find(c=>c.active);
                activeCharacter = character?.value
            })
        })
        return activeCharacter
    }
    return undefined;

});
export const selectIsSelectedCard = createSelector(selectAppState, (state: AppState)=> {
    if(state.listData){
        const list = Object.values(state.listData);
        const listResult =list.find(l=> l.isSelectedList);
        if(listResult){
            const cards =Object.values(listResult.values);
            const cardResult =cards.find(c=> c.selected);
            return cardResult?.cardId;
        }
        return undefined;
    }
    return undefined;

});
export const selectChineseCharactersList = createSelector(selectAppState, (state: AppState)=> state.chineseCharactersList);