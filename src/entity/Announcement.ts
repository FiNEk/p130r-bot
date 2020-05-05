import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Announcement {
  @PrimaryGeneratedColumn("increment")
  public id: string;

  @Column()
  public text: string;
}
