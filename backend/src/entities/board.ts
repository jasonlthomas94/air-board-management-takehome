import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // parent/child relationship
  @ManyToOne(() => Board, (board) => board.children, { onDelete: "CASCADE" })
  parent!: Board | null;

  @OneToMany(() => Board, (board) => board.parent)
  children!: Board[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
