export class GetFollowersQuery {
    constructor(
        public readonly userId: string,
        public readonly take: number = 10,
        public readonly skip: number = 0,
    ){}
}