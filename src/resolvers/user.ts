import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import { RequiredEntityData } from "@mikro-orm/core";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg("userData", () => UsernamePasswordInput) userData: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<User> {
        const hashedPwd = await argon2.hash(userData.password)
        const user = em.create(User, {
            username: userData.username,
             password: hashedPwd
        } as RequiredEntityData<User>)
        await em.persistAndFlush(user)
        return user
    }
    
}