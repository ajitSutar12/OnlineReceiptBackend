import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class CNFRECPURPOSEI {
    @PrimaryColumn()
    CODE: number

    @PrimaryColumn()
    SR_NO: number

    @Column()
    GL_ACNO: number
}
