

export interface ClickUpWorkSpace{
    id:string;
    name:string;
}

export interface ClickUpSpace{
    id:string;
    name:string;
}

export interface ClickUpList{
    id:string;
    name:string;
}
export type ClickUpSettings = {
    DefaultWorkSpaceID:string
    DefaultSpaceID: string
    DefaultListID: string
} 

export interface ClickUpElements {
    id:string;
    title:string;
    type:string;
    description:string;
    children: ClickUpElements[]
    space?: ClickUpSpace;
    list?:ClickUpList;

}
export interface ClickUpAIResponse {
    elements: ClickUpElements[]
}

