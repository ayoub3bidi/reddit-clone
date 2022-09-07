import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Upvote extends BaseEntity {
  @Column({ type: "int" })
  value: number;

  @PrimaryColumn()
  userId: number;
  
  @PrimaryColumn()
  postId: number;
  
  @ManyToOne(
    () => User, 
    (user) => user.upvotes
  )
  user: User;

  @ManyToOne(
    () => Post,
    (post) => post.upvotes,
    // { onDelete: "CASCADE" }
  )
  post: Post;
}