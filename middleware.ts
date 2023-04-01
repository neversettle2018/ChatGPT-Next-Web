import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

// 引入 http 以及 url 模块。
import http from "http";
import url from "url";

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
   
  // 通过 url.parse 解析 URL 中的查询参数和路径。
  const urlParts = url.parse(req.url, true);
  const path = urlParts.pathname ?? "/";
  const cookies = req.cookies;
  
  // 检查 IP 是否访问超过了 10 次。
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
  
  // 更新 IP 访问次数并保存到 cookie 中。
  res.cookie(ip, ipCount + 1);
   
   

    
    
    
    
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
