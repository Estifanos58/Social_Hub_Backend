export class UnFollowUserCommand {
    constructor(
        public readonly userId: string,
        public readonly followingId: string,
    ){}
}