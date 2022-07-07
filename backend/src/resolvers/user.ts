import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
    // Me 
    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req, em }: MyContext
        ) {
        // you are not logged in
        if (!req.session.userId) {
            return null
        }
        const user = await em.findOne(User, {_id : Number(req.session.userId)})
        return user
    }

    // Register ------------------------
    @Mutation(() => UserResponse)
    async register(
        @Arg("userData", () => UsernamePasswordInput) userData: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (userData.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: "length must be greater that 2"
                }]
            }
        }
        if (userData.password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: "length must be greater that 3"
                }]
            }
        }
        const hashedPwd = await argon2.hash(userData.password)
        const user = em.create(User, {
            username: userData.username,
             password: hashedPwd
        } as RequiredEntityData<User>)
        try {
            await em.persistAndFlush(user)
        } catch (err) {
            if (err.code == '23505' || err.detail.includes('already exists')) {
                // duplicate username error
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already taken'
                    }]
                }
            }
        }
        // *store user id session
        // *this will set a cookie on the user
        // *keep them logged in
        req.session.userId = String(user._id)
        
        return { user }
    }

    // Login --------------------------
    @Mutation(() => UserResponse)
    async login(
        @Arg("userData", () => UsernamePasswordInput) userData: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: userData.username })
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username does not exist'
                    },
                ]
            }
        }
        const valid = await argon2.verify(user.password, userData.password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'incorrect password'
                    }
                ]
            }
        }

        req.session.userId = String(user._id)

        return { user }
    }
    
}