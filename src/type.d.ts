declare namespace Express {
    export interface Request {
        user?: {
            sub: string;
            firstname: string;
            email: string;
        }
    }
}