import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CNFRECPURPOSEH } from './dropdown-entity/purpose.entity'
import { MSTCOMMDEPARTMENT } from './dropdown-entity/department.entity'
import { CNFRECPURPOSEI } from './dropdown-entity/dept.entity'
import { MSTACCTFEESSTRUH } from './dropdown-entity/challan.entity'
import { CNFONLINEBANKS } from './dropdown-entity/bank.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRNACCTONLINERCPTH } from './entity/TRNACCTONLINERCPTH.entity';
import { TRNACCTONLINERCPTI } from './entity/TRNACCTONLINERCPTI.entity'
import { TRNACCTMATH } from './entity/TRNACCTMATH.entity';
import { TRNACCTCOMMRCPTH } from './entity/TRNACCTCOMMRCPTH.entity';
import { TRNACCTCOMMRCPTI } from './entity/TRNACCTCOMMRCPTI.entity'
import { MSTACCTGLSUB } from '../registration/entity/college-code.entity'
import { FEEDBACK } from './entity/FEEDBACK.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([CNFRECPURPOSEH, MSTCOMMDEPARTMENT, CNFRECPURPOSEI, MSTACCTFEESSTRUH, CNFONLINEBANKS, TRNACCTMATH, MSTACCTGLSUB,FEEDBACK]),
  TypeOrmModule.forFeature([TRNACCTONLINERCPTH, TRNACCTONLINERCPTI, TRNACCTCOMMRCPTH, TRNACCTCOMMRCPTI], 'BWAYSCOMMON'),HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule { }
