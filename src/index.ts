import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
// import { RequiredEntityData } from "@mikro-orm/core";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up()

    const app = express(); 

    // const post = orm.em.fork({}).create(Post, {title: "my first post"} as RequiredEntityData<Post>);
    // await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {})
    // console.log(posts)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    })
    await apolloServer.start()
    apolloServer.applyMiddleware({ app })

    app.listen(5000, () => {
        console.log('server started on localhost: 5000')
    })
};

main().catch((err) => {
    console.log(err)
})