import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TRNACCTONLINERCPTH {
    @PrimaryColumn()
    TRAN_NO: number

    @Column()
    TRAN_TYPE: number

    @Column()
    TRAN_SUBTYPE: number

    @Column()
    TRAN_DATE: string

    @Column()
    PAID_BY: string

    @Column()
    TRAN_AMT: number

    @Column()
    UTR_NO: string

    @Column()
    RECTRAN_DATE: string

    @Column()
    REMARK: string

    @Column()
    IS_PRINTED: number

    @Column()
    STATUS_CODE: number

    @Column()
    SYSADD_DATETIME: string

    @Column()
    SYSADD_LOGIN: string

    @Column()
    SYSCHNG_DATETIME: string

    @Column()
    SYSCHNG_LOGIN: string

    @Column()
    USER_CODE: number

    @Column()
    SYS_DATE: string

    @Column()
    USER_NAME: string

    @Column()
    DEPT_CODE: number

    @Column()
    FEESTRU_CODE: number

    @Column()
    EXAM_NAME: string

    @Column()
    EXAM_YEAR: string

    @Column()
    REF_NO: string

    @Column()
    DEPT_NAME: string

    @Column()
    PAY_MODE: number

    @Column()
    FEESTRU_NAME: string

    @Column()
    PURPOSE_CODE: number

    @Column()
    SUB_GLACNO: number

    @Column()
    BANK_CODE: number

    @Column()
    EXPIRE_DATE: string
}


