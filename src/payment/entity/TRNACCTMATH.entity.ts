import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class TRNACCTMATH {
    @PrimaryColumn()
    TRAN_NO: number

    @Column()
    TRAN_TYPE: number

    @Column()
    TRAN_SUBTYPE: number

    @Column()
    SHORT_NAME: string

    @Column()
    TRAN_DATE: string

    @Column()
    FIN_YEAR: number

    @Column()
    GL_ACNO: number

    @Column()
    GL_ACNO1: number

    @Column()
    SUB_GLACNO: number

    @Column()
    PAID_TO: string

    @Column()
    PAY_MODE: number

    @Column()
    REF_TRANNO: number

    @Column()
    TRAN_AMT: number

    @Column()
    APPROVAL_BY: number

    @Column()
    CURRENCY: string

    @Column()
    EXCHNG_RATE: number

    @Column()
    IS_PRINT: number

    @Column()
    REF_TRANDATE: string

    @Column()
    REF_TRANYEAR: number

    @Column()
    SYSADD_DATETIME: string

    @Column()
    SYSADD_LOGIN: string

    @Column()
    SYSCHNG_DATETIME: string

    @Column()
    SYSCHNG_LOGIN: string

    @Column()
    SYSAPR_DATETIME: string

    @Column()
    SYSAPR_LOGIN: string

    @Column()
    SYSCHNG_REMARK: string

    @Column()
    STATUS_CODE: number

    @Column()
    SYS_DATE: string

    @Column()
    USER_NAME: string

    @Column()
    FILE_NO: string
}