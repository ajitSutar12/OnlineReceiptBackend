import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SessionSerializer } from './auth/session.serializer';
import { AuthModule } from './auth/auth.module';
// import { FAS, COMMON } from './orm.config'
import { DemoModule } from './demo/demo.module';
import { RegistrationModule } from './registration/registration.module';
import { PaymentModule } from './payment/payment.module';
import { RegistrationService } from './registration/registration.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ScheduleModule.forRoot(),
    // TypeOrmModule.forRoot(FAS), TypeOrmModule.forRoot(COMMON),  
    TypeOrmModule.forRoot({
      name: 'BWAYSCOMMON',
      type: 'oracle',
      username: 'paysuk',
      password: 'sukpay$321#',
      port: 1521,
      host: '192.168.4.121',
      database: 'PAYSUK',
      serviceName: 'payg1',
      synchronize: false,
      logging: true,
      // keepConnectionAlive : false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      extra: { poolMax: 44, poolMin: 3, poolTimeout: 4, queueTimeout: 120000},

    }),
    TypeOrmModule.forRoot({
      type: 'oracle',
      username: 'BWAYSFAS',
      password: 'bwaysfas',
      port: 1521,
      host: '192.168.4.92',
      database: 'BWAYSFAS',
      serviceName: 'fas21',
      synchronize: false,
      logging: true,
      // keepConnectionAlive: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      extra: { poolMax: 44, poolMin: 3, poolTimeout: 4, queueTimeout: 120000 },

    }),

    DemoModule, RegistrationModule, PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, SessionSerializer],
})
export class AppModule { }

