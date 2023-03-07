import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AUTHORITYMASTER } from './entity/authority-master.entity'
import { MSTCOMMDEPARTMENT } from './entity/department.entity'

@Injectable()
export class DemoService {
    constructor(@InjectRepository(MSTCOMMDEPARTMENT) private readonly formPostRepository: Repository<MSTCOMMDEPARTMENT>,) { }
    async fetch(): Promise<MSTCOMMDEPARTMENT[]> {
        let data = await this.formPostRepository.query('SELECT * FROM MSTCOMMDEPARTMENT');
        return data
    }

    async fetchSingleRecord(id): Promise<MSTCOMMDEPARTMENT> {
        let data = await this.formPostRepository.query(`select * from MSTCOMMDEPARTMENT where CODE=${id.id}`);
        return data
    }
}
