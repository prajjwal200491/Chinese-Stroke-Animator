export interface CharacterProperties {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    radicalColor?: string;
    delayBetweenLoops?: number;
}

export interface List{
    // nameWithoutSpaces: string;
    // nameWithSpaces: string;
    cardname :string;
    characters: Character[];
    selected: boolean;
    cardId?: number;
}

export interface ListData {
    [key : string]:{
        // nameWithoutSpaces: string;
        // nameWithSpaces: string;
        listname: string;
        values: {
            [key: string] :List
        };
        isSelectedList?:boolean;
        listId?:number;
        // Returned by GET /api/lists and used by the folder Public/Private
        // tabs -- reducers must preserve these when rebuilding a list.
        isPublic?:boolean;
        ownerId?:string|null;
    }
    // name: any;
    // values: List;
}

export interface Character{
    value: string;
    active: boolean;
    isTicked?:boolean;
}