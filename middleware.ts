import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

import { LocalStorage } from "./node-localstorage";
const MAX_VISITS = 10;
const localStorage = new LocalStorage("./scratch");
const ipVisits = new Map<string, number>();


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
  let visitCount = parseInt(localStorage.getItem(ipVisits.get(ip)?.toString() ?? "0"));
  console.log(`[Rate Limit] IP address ${ip} has visited ${visitCount} times.`);
  if (visitCount >= MAX_VISITS) {
    console.log(`[Rate Limit] IP address ${ip} reached the maximum limit.`);
    return NextResponse.json(
      {
         needAccessCode: true,
        message: `Too many requests from IP ${ip}`,
      },
      {
        status: 402,
      }
    );
  }

  visitCount++;
  localStorage.setItem(ipVisits.get(ip)?.toString() ?? "", visitCount.toString());
    

   
   

    
    
    
    
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
