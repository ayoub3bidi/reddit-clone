import path from "path";
import { DataSource } from "typeorm";
import { pwd } from "./constants";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/Upvote";
import { User } from "./entities/User";

export default new DataSource({
    type: 'postgres',
    database: 'redditBase2',
    username: 'postgres',
    password: pwd,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User ,Upvote]
})