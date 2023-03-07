import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTHORITYMASTER } from './entity/authority-master.entity'
import { MSTCOMMDEPARTMENT } from './entity/department.entity'
@Module({
  imports: [TypeOrmModule.forFeature([MSTCOMMDEPARTMENT,])],
  controllers: [DemoController],
  providers: [DemoService]
})
export class DemoModule { }
