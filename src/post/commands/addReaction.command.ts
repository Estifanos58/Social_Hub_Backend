export class AddReactionCommand {
    constructor(
        public readonly userId: string,
        public readonly postId: string,
        public readonly ractionType: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD'
    ){}
}