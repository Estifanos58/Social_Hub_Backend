export class GithubOAuthCommand {
    constructor(
        public readonly code: string,
        public readonly response: any
    ) {}
}