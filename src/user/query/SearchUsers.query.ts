export class SearchUsersQuery {
    constructor(
        public readonly userId: string,
        public readonly searchTerm: string,
        public readonly limit: number = 10,
        public readonly offset: number = 0,
    ) {}
}