import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class MSTACCTFEESSTRUH {
    @PrimaryColumn()
    CODE: number;

    @Column()
    NAME: string

    @Column()
    DEPT_CODE: number

    @Column()
    AMOUNT: number

    @Column()
    STRU_TYPE: string

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
    SUK_CODE: number

    @Column()
    SEMESTER: number

    @Column()
    NEW_AMOUNT: number
}
