import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import Result from "./Result";

@Entity()
export default class User {
  @Column()
  @PrimaryColumn()
  public id: string;
  
  @Column()
  @PrimaryColumn()
  public guildId: string;
  
  @Column()
  public isPlaying: boolean;

  @OneToMany(type => Result, result => result.winner)
  public wins: Result[];
}
