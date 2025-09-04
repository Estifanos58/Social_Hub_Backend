import { User } from '@prisma/client';

export class VerificationTokenEvent {
  constructor(
    public readonly user: User,
    public readonly token: string,
  ) {}
}
