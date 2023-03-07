import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class PASSRECQUE {
    @PrimaryColumn()
    CODE: Number

    @Column()
    NAME: String
}