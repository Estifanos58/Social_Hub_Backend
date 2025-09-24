import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { LoginEvent } from './login.event';

@Injectable()
export class LoginEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('auth.login')
  async handleLogin(event: LoginEvent) {
    const { userId, ip, userAgent } = event;
    await this.notifications.login(userId, { ip, userAgent });
  }
}
