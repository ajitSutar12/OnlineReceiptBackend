import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, } from 'typeorm';
@Entity()
export class CNFUSERS {
    @PrimaryColumn()
    USER_ID: string

    @Column()
    USER_TYPE: number

    @Column()
    NAME: string

    @Column()
    PASSWORD: string

    @Column({ nullable: true })
    SUB_GLACNO: number

    @Column({ nullable: true })
    COLLEGE_CODE: number

    @Column()
    CELL_NO: string

    @Column()
    EMAIL_ID: string

    @CreateDateColumn()
    CREATED_DATE: string

    @Column()
    VALID_TILL_DATE: string

    @Column({ default: 0 })
    STATUS_CODE: number

    @UpdateDateColumn()
    SYS_DATE: Date

    @Column({ nullable: true })
    USER_NAME: string

    @Column({ nullable: true })
    PASSREQQUE: number

    @Column({ nullable: true })
    PASSREQANS: string
}
