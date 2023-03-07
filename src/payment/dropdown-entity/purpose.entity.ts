import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class CNFRECPURPOSEH {
    @PrimaryColumn()
    CODE: number;

    @Column()
    NAME: string;

    @Column()
    TYPE: number
}
