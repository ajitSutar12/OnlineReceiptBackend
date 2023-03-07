import { Controller, Get, Param } from '@nestjs/common';
import { DemoService } from './demo.service'
import { MSTCOMMDEPARTMENT } from './entity/department.entity';

@Controller('demo')
export class DemoController {
    constructor(private formService: DemoService) { }
    @Get()
    fetchData(): Promise<MSTCOMMDEPARTMENT[]> {
        return this.formService.fetch()
    }

    @Get(':id')
    async edit(@Param() id): Promise<MSTCOMMDEPARTMENT> {
        return this.formService.fetchSingleRecord(id)
    }
}
