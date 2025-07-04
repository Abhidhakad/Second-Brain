import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { unknown } from "zod";

export interface JwtPayload {
  id: string;
  username: string;
}


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "No token, access denied" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return
  }
};
