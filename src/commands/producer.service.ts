import { Injectable } from '@nestjs/common';
import { RabbitmqConnectionService } from '../infrastructure/rabbitmq/rabbitmq-connection.service';

@Injectable()
export class ProducerService {
  private readonly EXCHANGE_NAME = 'notification-exchange';

  constructor(private readonly connectionService: RabbitmqConnectionService) {}

  async publishToLane(routingKey: string, payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      
      const channel = this.connectionService.getChannel();
      const isSent = channel.publish(
        this.EXCHANGE_NAME,
        routingKey, 
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
        (err) => (err ? reject(err) : resolve())
      );

      if (!isSent) {
        channel.once('drain', () => resolve());
      }
    });
  }
}
