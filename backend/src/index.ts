import "reflect-metadata";
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
import Redis from "ioredis";
import datasource from './type-orm.config'

const main = async () => {
    // * typeORM database connection
    await datasource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err)
        })
    await datasource.runMigrations()

    // await Post.delete({}) //? this will delete all posts from DB

    const app = express(); 

    // * connect-redis config
    const  RedisStore = connectRedis(session)
    const redisClient = new Redis(process.env.REDIS_URL)
    
    // ! In case the operations on Apollo server (5000/graphql) didn't work comment app.use below
    // ! and change cors in apolloServer.applyMiddleware below from "false" to { origin: "http://localhost:3000" } or { origin: "*" }
    // ! Pls revert this back after doing your operations to make the frontend work properly
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }))

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
            secret: process.env.SESSION_SECRET,
            resave: false,
        })
    )

    // * Apollo server 
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redisClient })
    })
    await apolloServer.start()
    
    apolloServer.applyMiddleware({
        app,
        cors: false,
        // cors: { origin: "*" }
    })

    app.listen(parseInt(process.env.PORT), () => {
        console.log('server started on localhost: 5000')
    })
};

main().catch((err) => {
    console.log(err)
})