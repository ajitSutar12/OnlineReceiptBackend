import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class TRNACCTCOMMRCPTI {
    @PrimaryColumn()
    TRAN_NO: number

    @PrimaryColumn()
    SR_NO: number

    @Column()
    TRAN_DATE: string

    @Column()
    GL_ACNO: number

    @Column()
    FEES_CODE: number

    @Column()
    AMOUNT: number

    @Column()
    IS_DEBT: number

    @Column()
    STATUS_CODE: number

    @Column()
    SYS_DATE: string

    @Column()
    USER_NAME: string

    @Column()
    PERCENTAGE: number

    @Column()
    TDS_CODE: number

    @Column()
    TAXON_AMOUNT: number

    @Column()
    LBT_CODE: number

    @Column()
    TAX_CODE: number

    @Column()
    BUDGET_CODE: string
}