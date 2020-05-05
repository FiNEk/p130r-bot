import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import User from "./User";

@Entity()
export default class Result {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public guildId: string;

  @Column()
  public resultDate: Date;

  @Column()
  public winnerId: string;

  @ManyToOne((type) => User, (user) => user.wins)
  public winner: User;
}
