export class FollowUserCommand {
    constructor(
        public readonly userId: string,
        public readonly followingId: string
    ) {}
}