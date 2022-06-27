import { MikroORM } from "@mikro-orm/core";
// import { RequiredEntityData } from "@mikro-orm/core";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up()

    const app = express(); 

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        })
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