import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

// 引入 http 以及 url 模块。
import http from "http";
import url from "url";

export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};


/ 声明全局变量，保存 IP 访问次数。
const ipCountRecord: Record<string, number> = {};
interface CustomCookies extends RequestCookies {
  // 通过泛型将 cookie 值类型更改为 number，避免出现 Element implicitly has an 'any' type 错误。
  [key: string]: number;
}


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
   
  const urlParts = url.parse(req.url, true);
  const path = urlParts.pathname ?? "/";

  // 更新 IP 访问次数并保存到 cookie 中。
  const cookies = req.cookies as CustomCookies;
  const ipCount = cookies[ip] ?? 0;
  if (ipCount >= 10) {
    return NextResponse.json(
      {
        message: "IP 访问次数超限。",
      },
      {
        status: 403,
      }
    );
  }
  res.cookie(ip, ipCount + 1);

  // 更新全局 IP 访问次数记录。
  if (ipCountRecord[ip]) {
    ipCountRecord[ip] = ipCountRecord[ip] + 1;
  } else {
    ipCountRecord[ip] = 1;
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
