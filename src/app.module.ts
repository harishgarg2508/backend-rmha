import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './infrastructure/database/config/type-orm.config';
import { CreateUserModule } from './feature/create-user/create-user.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { CommandsModule } from './commands/commands.module';
import { RabbitmqModule } from './infrastructure/rabbitmq/rabbitmq.module';

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
    CommandsModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
