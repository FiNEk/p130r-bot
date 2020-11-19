import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export default class ActiveGuildUser {
  @Column()
  @PrimaryColumn()
  public id: string;

  @Column()
  @PrimaryColumn()
  public guildId: string;

  @Column()
  public isActiveUser: boolean;
}
