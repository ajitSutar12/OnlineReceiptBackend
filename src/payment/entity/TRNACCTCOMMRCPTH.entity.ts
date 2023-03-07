import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class TRNACCTCOMMRCPTH {
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
    PAID_BY: string

    @Column()
    GL_ACNO: number

    @Column()
    SUB_GLACNO: number

    @Column()
    EXAM_NAME: string

    @Column()
    EXAM_MONTH: string

    @Column()
    EXAM_YEAR: string

    @Column()
    EXT_RECNO: string

    @Column()
    PAY_MODE: number

    @Column()
    EXT_PREFIX: string

    @Column()
    EXT_REFNO: string

    @Column()
    EXT_REFDATE: string

    @Column()
    BANK_CODE: number

    @Column()
    DEPT_CODE: number

    @Column()
    FEESTRU_CODE: number

    @Column()
    TRAN_AMT: number

    @Column()
    CURRENCY: string

    @Column()
    EXCHNG_RATE: number

    @Column()
    IS_PRINT: number

    @Column()
    STUDENT_CODE: number

    @Column()
    REF_TRANNO: number

    @Column()
    REF_TRANDATE: string

    @Column()
    REF_TRANYEAR: number

    @Column()
    PAID_TYPE: number

    @Column()
    FDR_NO: string

    @Column()
    BRANCH_NAME: string

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
    IS_TDS: number

    @Column()
    IS_VAT: number

    @Column()
    IS_LBT: number

}