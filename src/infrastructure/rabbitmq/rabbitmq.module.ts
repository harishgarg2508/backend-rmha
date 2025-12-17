import { Module } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq-connection.service';
import { RabbitmqConfigurerService } from './rabbitmq-configurer.service';
import { ProducerService } from '../../commands/producer.service';

@Module({
  providers: [
    RabbitmqConnectionService,
    RabbitmqConfigurerService,
    ProducerService,
  ],
  exports: [
    RabbitmqConnectionService,
    RabbitmqConfigurerService,
    ProducerService,
  ],
})
export class RabbitmqModule {}
