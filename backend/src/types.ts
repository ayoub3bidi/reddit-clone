import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from "express"
import { Session } from "express-session"

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request & { session?: Session }
    res: Response
} 
// ! problem solved: userId does ot exist on type 'Session & Partial<SessionData>
declare module "express-session" {
    interface Session {
      userId: string;
    }
  }