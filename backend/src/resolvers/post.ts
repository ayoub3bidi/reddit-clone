import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { RequiredEntityData } from "@mikro-orm/core";

@Resolver()
export class PostResolver {
    // GET Posts
    @Query(() => [Post])
    posts(@Ctx() {em}: MyContext): Promise<Post[]> {
        return em.find(Post, {})
    }
    // GET Post by id
    @Query(() => Post, {nullable: true})
    post(
        @Arg("id") _id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { _id })
    }
    // POST Post
    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post> {
        const post = em.fork({}).create(Post, { title } as RequiredEntityData<Post>);
        await em.persistAndFlush(post)
        return post
    }
    // UPDATE Post
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") _id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, {_id})
        if (!post) {
            return null
        }
        if (typeof title != 'undefined') {
            post.title = title
            await em.persistAndFlush(post)
        }
        return post
    }
    // DELETE Post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") _id: number,
        @Ctx() {em}: MyContext
    ): Promise<boolean> {
        await em.nativeDelete(Post, { _id })
        return true
    }
}