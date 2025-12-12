import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './infrastructure/database/config/type-orm.config';
import { CreateUserModule } from './feature/create-user/create-user.module';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQConfig } from './infrastructure/rabbitmq/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return dataSourceOptions;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource({
          dataSource: new DataSource(options),
        });
      },
    }),
    CreateUserModule,
    ClientsModule.register(rabbitMQConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
