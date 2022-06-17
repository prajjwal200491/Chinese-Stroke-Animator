import { createAction, props } from "@ngrx/store";
import HanziWriter from "hanzi-writer";
import { Character, CharacterProperties, List } from "./app.model";

export const searchCharacter = createAction(`Search Character`, props<{search: string}>());
export const updateCharacter = createAction(`Update Character`, props<{character: string}>());
export const loadCharacterDecomposition = createAction(`Load Character Decomposition`);
export const loadRelatedWords = createAction(`Load Related Words`);
export const loadRelatedWordsEnded = createAction(`Load Related Words Ended`, props<{relatedWords: string}>());
export const loadCharacter = createAction(`Load Character`, props<{id: string, text: string, properties: CharacterProperties}>());
export const loadCharacterEnded = createAction(`Load Character Ended`, props<{writer:HanziWriter}>());
export const loadCharacterDecompositionEnded = createAction(`Load Character Decomposition Ended`, props<{decomposition: string}>());
export const addNewList = createAction(`Add New List`, props<{list: List}>());
export const updateList = createAction(`Update List`, props<{list: List}>());
export const reschuffleList = createAction(`Reschuffle List`, props<{list: List}>());
export const saveReschuffledList = createAction(`Save Reschuffle List`, props<{list: List[]}>());
export const setActiveCharacterList = createAction(`Set Active Character List`, props<{character: Character, listName: string}>());

