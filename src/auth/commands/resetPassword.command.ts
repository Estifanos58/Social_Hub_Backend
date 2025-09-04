export class ResetPasswordCommand {
    constructor(
        public readonly userId: string,
        public readonly resetToken: string,
        public readonly newPassword: string,
    ){}
}