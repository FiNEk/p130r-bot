import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Token {
  @PrimaryGeneratedColumn("increment")
  public tid: string;

  @Column()
  public token: string;

  @Column("int")
  public expiresAt: number;
}
