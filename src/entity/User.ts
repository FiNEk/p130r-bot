import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @Column()
  @PrimaryColumn()
  public id: number;

  @Column()
  public guildId: number;

  @Column()
  public isPlaying: boolean;
}
