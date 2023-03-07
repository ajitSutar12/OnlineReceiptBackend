import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class TRNACCTONLINERCPTI {
    @PrimaryColumn()
    TRAN_NO: number

    @PrimaryColumn()
    SR_NO: number

    @Column()
    GL_ACNO: number

    @Column()
    FEES_CODE: number

    @Column()
    AMOUNT: number

    @Column()
    STATUS_CODE: number

    @Column()
    SYS_DATE: string

    @Column()
    USER_NAME: string

    @Column()
    BUDGET_CODE: string

    @Column()
    BUDGET_HEAD: string

    @Column()
    PARTICULARS: string

    @Column()
    FEES_AMOUNT: number
}