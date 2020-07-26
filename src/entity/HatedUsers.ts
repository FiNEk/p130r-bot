import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export default class HatedUser {
  @Column()
  @PrimaryColumn()
  public id: string;
}
