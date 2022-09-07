import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;
  
  @Field()
  @Column({ unique: true })
  email!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[]

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[]
  
  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @CreateDateColumn()
  updatedAt: Date;
}