import { Transport, ClientProviderOptions } from '@nestjs/microservices';

export const rabbitMQConfig: ClientProviderOptions[] = [
  {
    name: 'RABBITMQ_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: process.env.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
      noAck: false,
      persistent: true,
    },
  },
];
