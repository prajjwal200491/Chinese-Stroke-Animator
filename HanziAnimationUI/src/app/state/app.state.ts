import { createFeatureSelector } from "@ngrx/store";
import HanziWriter from "hanzi-writer";
import { List } from "./app.model";
export interface AppState{
    search: string;
    recentlyTyped: string[];
    decomposition: string;
    writer?: HanziWriter;
    character: string;
    list: List[];
    relatedWords: string
}

export const selectAppState = createFeatureSelector<AppState>('character');