import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    // GET Posts
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find()
    }
    // GET Post by id
    @Query(() => Post, {nullable: true})
    post(@Arg("id") _id: number): Promise<Post | null> {
        return Post.findOne({ where: { _id: _id } })
    }
    // POST Post
    @Mutation(() => Post)
    async createPost(@Arg("title") title: string): Promise<Post> {
        return Post.create({title}).save()
    }
    // UPDATE Post
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") _id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { _id: _id } })
        if (!post) {
            return null
        }
        if (typeof title != 'undefined') {
            await Post.update({ _id }, { title })
        }
        return post
    }
    // DELETE Post
    @Mutation(() => Boolean)
    async deletePost(@Arg("id") _id: number): Promise<boolean> {
        await Post.delete({ _id: _id })
        return true
    }
}