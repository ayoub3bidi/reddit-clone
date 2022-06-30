import { pwd, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        glob: '!(*.d).{js,ts}'
    },
    allowGlobalContext: true,
    entities: [Post, User],
    dbName: "redditBase",
    type: "postgresql" ,
    user: "postgres",
    password: pwd,
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];