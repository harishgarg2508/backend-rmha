import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();
  await CommandFactory.run(AppModule);
}

bootstrap();
