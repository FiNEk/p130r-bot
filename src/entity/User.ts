import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @Column()
  @PrimaryColumn()
  id: number;
  
  @Column()
  public guildId: number;
  
  @Column()
  public isPlaying: boolean;
}
