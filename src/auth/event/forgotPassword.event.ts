export class ForgotPasswordEvent {
    constructor(
        public readonly firstname: string,
        public readonly email: string,
        public readonly resetToken: string,
    ){}
}