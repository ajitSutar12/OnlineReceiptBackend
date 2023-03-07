import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class FEEDBACK {
    @PrimaryColumn()
    ID: number;

    @Column()
    REASON_ID : number;

    @Column()
    DESCRIPTION : string;

    @Column()
    EMAIL_ID : string;

    @Column()
    SYSADD_LOGIN :string;

    @Column()
    SYSADD_DATETIME: string;

}