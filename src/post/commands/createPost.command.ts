export class CreatePostCommand {
    constructor(
        public readonly userId: string,
        public readonly content: string,
        public readonly imageUrls?: string[]
    ) {}
}