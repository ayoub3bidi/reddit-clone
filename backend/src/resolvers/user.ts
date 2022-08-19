import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import { RequiredEntityData } from "@mikro-orm/core";
import argon2 from 'argon2'
import { COOKIE, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { sendEmail } from "../utils/sendEmail";
import {v4} from "uuid"

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
    // ? change password-------------------
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redisClient, em, req }: MyContext
    ) : Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Length must be greater than 2",
                    },
                ],
            };
        }
        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redisClient.get(key)
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Token expired"
                    }
                ]
            }
        }

        const user = await em.findOne(User, { _id: parseInt(userId) })

        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User no longer exist"
                    }
                ]
            }
        }

        user.password = await argon2.hash(newPassword)
        await em.persistAndFlush(user)

        await redisClient.del(key)

        // * login user after change password
        req.session.userId = user._id.toString()

        return { user }
    }

    // ? forgot password-------------------
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em, redisClient }: MyContext
        ) {
        const user = await em.findOne(User, { email })
        if (!user) {
            // the email is not in the db
            return true
        }

        const token = v4()
        await redisClient.set(
            FORGET_PASSWORD_PREFIX + token,
            user._id, "EX" ,
            1000 * 60 * 60 * 24 * 3 // ? 3 days
        )
        
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
        )

        return true
    }

    // ? Me----------------------------
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

    // ? Register ------------------------
    @Mutation(() => UserResponse)
    async register(
        @Arg("userData") userData: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(userData)
        if (errors) {
            return { errors }
        }

        const hashedPwd = await argon2.hash(userData.password)
        const user = em.create(User, {
            username: userData.username,
            email: userData.email,
             password: hashedPwd
        } as RequiredEntityData<User>)
        try {
            // * a "barbarian" Knex query insertion option (don't worry about it)
            // (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
            //     username: userData.username,
            //     email: userData.email,
            //     password: hashedPwd,
            //     createdAt: new Date(),
            //     updatedAt: new Date()
            // })
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

    // ? Login --------------------------
    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail })
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
        const valid = await argon2.verify(user.password, password)
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

    // ? Logout---------------------------
    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
        req.session.destroy((err) => {
            res.clearCookie(COOKIE);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        })
        );
    }
}