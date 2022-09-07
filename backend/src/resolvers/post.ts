import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
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

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
} 

@Resolver()
export class PostResolver {
    // * Upvote
    @Mutation(()  => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const userId = parseInt(req.session.userId)
        await datasource.query(
            `
            START TRANSACTION;
            INSERT INTO upvote ("userid", "postId", value)
            value (${userId}, ${postId}, ${realValue});
            UPDATE post
            SET points = points + ${realValue}
            WHERE _id = ${postId};
            COMMIT;
            `
        )
    }


    // * GET Posts
    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = Math.min(50, limit) + 1
        const queryBuilder = datasource
            .getRepository(Post)
            .createQueryBuilder("post")
            // ! TypeError: Cannot read property 'databaseName' of undefined
            // .innerJoinAndSelect("creator", "user", 'user._id = CAST (post."creatorId" as INTEGER)')
            .orderBy('post."createdAt"', "DESC")
            .take(realLimitPlusOne)
        if (cursor) {
            queryBuilder.where('post."createdAt" < :cursor', { cursor: new Date (parseInt(cursor)) })
        }

        const posts = await queryBuilder.getMany()

        // ? this is SQL query option but it didn't work either
        // const replacements: any[] = [realLimitPlusOne];
        // if (cursor) {
        // replacements.push(new Date(parseInt(cursor)));
        // }
        // const posts = await datasource.query(`
        //     SELECT post.*,
        //     json_build_object(
        //         'id', user._id,
        //         'username', user.username
        //         'email', user.email
        //         'createdAt', user.createdAt
        //         'updatedAt', user.updatedAt
        //     ) creator
        //     FROM post
        //     INNER JOIN public.user ON user._id = CAST (post."creatorId" as INTEGER)
        //     ${cursor ? `WHERE p."createdAt" < $2` : ""}
        //     ORDER BY post."createdAt" DESC
        //     LIMIT $1
        // `, replacements);

        return { posts: posts.slice(0, realLimit) , hasMore: posts.length === realLimitPlusOne }
    }
    // * GET Post by id
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