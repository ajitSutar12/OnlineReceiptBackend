import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
export class CNFONLINEBANKS {
    @PrimaryColumn()
    CODE: number

    @Column()
    NAME: String

    @Column()
    GL_ACNO: number
}
