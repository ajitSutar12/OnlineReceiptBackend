import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { CNFUSERS } from './entity/registration.entity'
import { MSTACCTGLSUB } from './entity/college-code.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { PASSRECQUE } from './entity/passrecque.entity'
import { TRNACCTONLINERCPTH } from '../payment/entity/TRNACCTONLINERCPTH.entity'
import { TRNACCTCOMMRCPTH } from '../payment/entity/TRNACCTCOMMRCPTH.entity'
import { CNFONLINEBANKS } from '../payment/dropdown-entity/bank.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([CNFUSERS, PASSRECQUE, TRNACCTONLINERCPTH, TRNACCTCOMMRCPTH], 'BWAYSCOMMON'),
    TypeOrmModule.forFeature([MSTACCTGLSUB, CNFONLINEBANKS])
    // TypeOrmModule.forFeature([CNFUSERS, MSTACCTGLSUB])
    // TypeOrmModule.forFeature([FORMS]),
    // TypeOrmModule.forFeature([AUTHORITYMASTER], 'localDB'),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService]
})
export class RegistrationModule { }
