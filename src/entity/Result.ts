import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Result {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public guildId: number;

    @Column()
    public resultDate: Date;

    @Column()
    public winnerId: number;
}