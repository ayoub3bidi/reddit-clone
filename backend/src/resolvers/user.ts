import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from 'argon2'
import { COOKIE, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { sendEmail } from "../utils/sendEmail";
import {v4} from "uuid"
import datasource from '../type-orm.config'

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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext) {
        if (req.session.userId === user._id.toString()) {
            return user.email
        }
        return ""
    }

    // ? change password-------------------
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redisClient, req }: MyContext
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

        const userIdNum = parseInt(userId)
        const user = await User.findOne({ where: { _id: userIdNum } })

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

       await User.update({_id: userIdNum }, { password: await argon2.hash(newPassword) })

        await redisClient.del(key)

        // * login user after change password
        req.session.userId = user._id.toString()

        return { user }
    }

    // ? forgot password-------------------
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redisClient }: MyContext
        ) {
        const user = await User.findOne({ where: { email: email } })
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
    me(
        @Ctx() { req }: MyContext
        ) {
        // you are not logged in
        if (!req.session.userId) {
            return null
        }
        return User.findOne({ where: {_id : Number(req.session.userId) } })
    }

    // ? Register ------------------------
    @Mutation(() => UserResponse)
    async register(
        @Arg("userData") userData: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(userData)
        if (errors) {
            return { errors }
        }

        const hashedPwd = await argon2.hash(userData.password)
        let user;
        try {
            // User.create({}).save() // ? the one-line equivalent to what below
            const result = await datasource
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                { 
                    username: userData.username,
                    email: userData.email,
                    password: hashedPwd
                },
            ])
            .returning('*')
            .execute()
            user = result.raw[0]
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
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } })
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