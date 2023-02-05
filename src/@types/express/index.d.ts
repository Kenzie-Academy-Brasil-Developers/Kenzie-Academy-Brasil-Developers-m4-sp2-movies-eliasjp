import { IMovieExtended } from "../../interface";

declare global {
    namespace Express {
        interface Request {
            movie: IMovieExtended;
        }
    }
}