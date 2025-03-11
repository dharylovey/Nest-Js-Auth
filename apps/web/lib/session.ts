import { SignJWT } from "jose/jwt/sign";
import { cookies } from "next/headers";

export type Session = {
  user: {
    id: string;
    name: string;
  };
  //   accessToken: string;
  //   refreshToken: string;
};

const secretKey = process.env.SESSION_SECRE_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiredAt)
    .sign(encodedKey);

  cookies.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: expiredAt,
    path: "/",
  });
}
