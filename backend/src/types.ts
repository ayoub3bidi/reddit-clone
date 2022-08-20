import { Request, Response } from "express"
import { Session } from "express-session"
import Redis from "ioredis"

export type MyContext = {
    req: Request & { session?: Session }
    redisClient: Redis
    res: Response
} 
declare module "express-session" {
    interface Session {
      userId: string; // * problem solved: userId does ot exist on type 'Session & Partial<SessionData>
    }
  }