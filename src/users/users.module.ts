import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CNFUSERS } from 'src/registration/entity/registration.entity';
import { UsersService } from './users.service';

@Module({
  imports:[TypeOrmModule.forFeature([CNFUSERS], 'BWAYSCOMMON'),],
  providers: [UsersService],
  exports: [UsersService],

})
export class UsersModule {}
