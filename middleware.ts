import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

// 对于每个IP，访问次数的存储数据结构 {ip1: count1, ip2: count2, ...} 
const ipAccessCount = new Map();
// 对于每个IP，访问次数保存在cookies中的名称
const ipAccessCountCookieName = "IP_ACCESS_COUNT";
// 限制IP最大访问次数 
const maxAccessCount = 10;


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
   

   let accessCount = ipAccessCount.get(ip) ?? 0;
   if (req.cookies[ipAccessCountCookieName]) {
     accessCount = parseInt(req.cookies[ipAccessCountCookieName]); 
    ipAccessCount.set(ip, accessCount); 
   }
 
   if (accessCount >= maxAccessCount) { 
     return NextResponse.json( {
       error: "IP access count exceeded", }, { status: 403, } 
     );
   }

   accessCount++; 
   ipAccessCount.set(ip, accessCount); 
   res.cookie(ipAccessCountCookieName, accessCount.toString());
   
   

    
    
    
    
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
