import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
}


export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "No token, access denied" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    req.userId = decoded.id;


    console.log(`Authenticated user ID: ${req.userId}`);

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
