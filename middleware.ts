import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

const MAX_REQUEST_PER_IP = 10; // 每个 IP 最大请求次数
const COOKIE_EXPIRE_TIME = 240 * 3600; // cookie 过期时间，单位为秒


export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};

export function middleware(req: NextRequest, res: NextResponse) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ip = req.headers.get("x-forwarded-for") ?? "";

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[Auth] ip:", ip);
  
 if (!accessCode && !token) {
   
   console.log("invoke ip check...");
   
     // 获取该 IP 对应的 cookie 值
  const cookies = req.cookies();
  let requestCount = cookies[ip] ? parseInt(cookies[ip]) : 0;

  // 判断是否需要更新 cookie
  if (!cookies[ip]) {
    res.cookie(ip, "1", {
      maxAge: COOKIE_EXPIRE_TIME * 1000,
    });
  } else {
    requestCount++;
    res.cookie(ip, requestCount.toString(), {
      maxAge: COOKIE_EXPIRE_TIME * 1000,
    });
  }

  // 判断是否达到最大请求次数
  if (requestCount >= MAX_REQUEST_PER_IP) {
    return NextResponse.json(
      {
        needAccessCode: true,
        error: "Too many requests from your IP. Please try again later.",
      },
      {
        status: 402,
      }
    );
  } 

    

   
   

    
    
    
    
  } else if (ACCESS_CODES.size > 0 && !ACCESS_CODES.has(hashedCode) && !token) {
    console.log("invoke orig");
    return NextResponse.json(
      {
        needAccessCode: true,
        hint: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.next();
}
