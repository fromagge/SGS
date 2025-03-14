import { JwtPayload } from "jsonwebtoken";

export type ClientJwtPayload = JwtPayload & {
  email: string;
  id: number;
};
