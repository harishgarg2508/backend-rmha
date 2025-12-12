import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  sendNotification() {
    this.client.emit('notification', {
      msg: 'Hello from Backend!',
      date: new Date(),
    });
    return 'Notification sent';
  }
}
