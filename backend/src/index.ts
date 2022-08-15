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
import session from "express-session";
import connectRedis from 'connect-redis'
import cors from 'cors'
import { COOKIE, __prod__ } from "./constants";

const main = async () => {
    const orm = await MikroORM.init(microConfig);

    // ? use this to wipe ur data
    // ? in case there's migration problems
    // await orm.em.nativeDelete(User, {})

    await orm.getMigrator().up()

    const app = express(); 

// * connect-redis config for redis@v4
    const  RedisStore = connectRedis(session)
    const { createClient } = require("redis")
    const redisClient = createClient({ legacyMode: true })
    // ! In case the operations on Apollo server (5000/graphql)
    // ! didn't work comment app.use below
    // ! and change cors in apolloServer.applyMiddleware below from "false"
    // ! to { origin: "http://localhost:3000" }
    // ! Pls revert this back after doing your operations to make the frontend work properly
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))
    redisClient.connect().catch(console.error)

    app.use(
        session({
            name: COOKIE,
            store: new RedisStore({
                client: redisClient,
                disableTTL: true,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // * a decade
                httpOnly: true,
                sameSite: "lax", // * lax is the relaxed form of cross-site request protection,
                secure: __prod__ // * cookie only works in https
            },
            saveUninitialized: false,
            secret: "lesgotothebeach",
            resave: false,
        })
    )
    
// * ORM post creation
    // const post = orm.em.fork({}).create(Post, {title: "my first post"} as RequiredEntityData<Post>);
    // await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {})
    // console.log(posts)
    
// * Apollo server 
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res })
    })
    await apolloServer.start()
    
    apolloServer.applyMiddleware({
        app,
        cors: false,
    })

    app.listen(5000, () => {
        console.log('server started on localhost: 5000')
    })
};

main().catch((err) => {
    console.log(err)
})