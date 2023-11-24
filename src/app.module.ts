import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { LoggerMiddleware as TasksMiddleware } from './tasks/middlewares/logger.middleware';
import { LoggerMiddleware as UsersMiddleware } from './users/middlewares/logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', { dbName: 'todo' }),
    TasksModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TasksMiddleware).forRoutes('tasks');
    consumer.apply(UsersMiddleware).forRoutes('user');
  }
}
