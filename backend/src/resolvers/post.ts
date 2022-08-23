import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import datasource from '../type-orm.config'

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@Resolver()
export class PostResolver {
    // * GET Posts
    @Query(() => [Post])
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit)
        const queryBuilder = await datasource
            .getRepository(Post)
            .createQueryBuilder("post")
            .orderBy('"createdAt"', "DESC")
            .take(realLimit)
        if (cursor) {
            queryBuilder.where('"createdAt" < :cursor', { cursor: new Date (parseInt(cursor)) })
        }
        return queryBuilder.getMany()
    }
    // GET Post by id
    @Query(() => Post, {nullable: true})
    post(@Arg("id") _id: number): Promise<Post | null> {
        return Post.findOne({ where: { _id: _id } })
    }
    // * POST Post
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save()
    }
    //* UPDATE Post
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
    // * DELETE Post
    @Mutation(() => Boolean)
    async deletePost(@Arg("id") _id: number): Promise<boolean> {
        await Post.delete({ _id: _id })
        return true
    }
}