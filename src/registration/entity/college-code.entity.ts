import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class MSTACCTGLSUB {
    @PrimaryColumn()
    SUB_GLACNO: number

    @Column()
    SUB_GLCODE: number

    @Column()
    SUBGL_NAME: string

    @Column()
    SHORT_NAME: string

    @Column()
    ADDRESS1: string

    @Column()
    ADDRESS2: string

    @Column()
    ADDRESS3: string

    @Column()
    CITY_CODE: number

    @Column()
    PIN_CODE: string

    @Column()
    PHONE_NO1: string

    @Column()
    PHONE_NO2: string

    @Column()
    FAX_NO: string

    @Column()
    EMAIL_ID: string

    @Column()
    WSBSITE: string

    @Column()
    SST_NO: string

    @Column()
    SST_DATE: string

    @Column()
    CST_NO: string

    @Column()
    CST_DATE: string

    @Column()
    SERVICETAX_NO: string

    @Column()
    SERVICETAX_DATE: string

    @Column()
    PAN_NO: string

    @Column()
    TDS_CODE: number

    @Column()
    BANK_NAME: string

    @Column()
    BANK_BRANCH: string

    @Column()
    BANK_ADDRESS: string

    @Column()
    BANK_PHONENO: string

    @Column()
    BANK_ACTYPE: string

    @Column()
    BANK_ACNO: string

    @Column()
    BANK_CODE: number

    @Column()
    IFSC_CODE: string

    @Column()
    IS_ACTIVE: number

    @Column()
    IS_DEFAULTBANK: number

    @Column()
    SORT_ORDER: number

    @Column()
    PARTY_CODE: string

    @Column()
    ADHAR_CARD_NO: string

    @Column()
    SUK_CODE: string

    @Column()
    SYSADD_DATETIME: string

    @Column()
    SYSADD_LOGIN: string

    @Column()
    SYSCHNG_DATETIME: string

    @Column()
    SYSCHNG_LOGIN: string

    @Column()
    STATUS_CODE: number

    @Column()
    SYS_DATE: string

    @Column()
    USER_NAME: string

    @Column()
    SUK_TDSTYPE: string

    @Column()
    SUK_TAXCATID: number

    @Column()
    IS_NEFTBANKAC: number
}



