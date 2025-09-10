export class UpdateUserCommand {
    constructor(
        public readonly userId: string,
        public readonly firstname?: string,
        public readonly lastname?: string,
        public readonly bio?: string,
        public readonly avatarUrl?: string,
        public readonly isPrivate?: boolean,
        public readonly twoFactorEnabled?: boolean,
    ) {}
}