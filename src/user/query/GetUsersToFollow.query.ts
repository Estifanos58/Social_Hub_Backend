export class GetUsersToFollowQuery {
    constructor(
        public readonly userId: string,
        public readonly limit: number = 10,
        public readonly offset: number = 0 // Default offset is 0, 10, 20, 30 ...
    ){}
}