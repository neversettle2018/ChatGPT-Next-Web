import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

const ipVisits: { [key: string]: number } = {}; // to keep track of IP visits

export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};

export function middleware(req: NextRequest, res: NextResponse) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ip = req.headers.get("x-real-ip") ?? "";

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[Auth] ip:", ip);
  
  if (!accessCode && !token) {
    
     console.log("invoke ip check...");
    
     // check number of visits by IP
      if(ip in ipVisits && ipVisits[ip] >= 10) {
        console.log(`[Rate Limit] IP address ${ip} reached the maximum limit.`);
        return NextResponse.json(
          {
            message: 'Sorry! You have reached the maximum limit of visits from this IP address',
          },
          {
            status: 402,
          }
        );
      } else {
        ipVisits[ip] = (ipVisits[ip] || 0) + 1;
        console.log(`[Rate Limit] IP address ${ip} has visited ${ipVisits[ip]} times.`);
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
