import { createFeatureSelector } from "@ngrx/store";
import HanziWriter from "hanzi-writer";
import { List, ListData } from "./app.model";
export interface AppState{
    search: string;
    recentlyTyped: string[];
    decomposition: string;
    writer?: HanziWriter;
    groupWriters: string[];
    character: string;
    list: List[];
    listIds: string[];
    testList: List[];
    listData?: ListData;
    relatedWords: string;
    groupCharactersDecomposition: GroupCharacter[];
    groupCharactersRelatedWords: GroupCharacter[];
}

export interface GroupCharacter{
    character?:string;
    decomposition?: string;
    relatedWords?: string;
}
export type Decomposition={character: string; decomposed: string}

export const selectAppState = createFeatureSelector<AppState>('character');