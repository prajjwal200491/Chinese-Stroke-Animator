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
    name: string;
    characters: Character[];
    selected: boolean;
}

export interface ListData {
    [key : string]:{
        name: string;
        values: {
            [key: string] :List
        };
        isSelectedList?:boolean;
    }
    // name: any;
    // values: List;
}

export interface Character{
    value: string;
    active: boolean;
}