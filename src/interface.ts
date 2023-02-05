export interface IMovieType {
    name: string;
    description: string;
    duration: number;
    price: number;
}

export interface IMovieExtended extends IMovieType {
    id: number;
}