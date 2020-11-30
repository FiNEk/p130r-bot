import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class PidorAnnouncement {
  @PrimaryGeneratedColumn("increment")
  public id: string;

  @Column()
  public text: string;
}
