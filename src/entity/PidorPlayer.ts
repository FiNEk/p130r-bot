import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import PidorResult from "./Result";

@Entity()
export default class PidorPlayer {
  @Column()
  @PrimaryColumn()
  public id: string;

  @Column()
  @PrimaryColumn()
  public guildId: string;

  @Column()
  public isPlaying: boolean;

  @OneToMany((type) => PidorResult, (result) => result.winner)
  public wins: PidorResult[];
}
