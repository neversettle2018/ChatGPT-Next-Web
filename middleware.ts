import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};

const IP_LIMIT = 10;

export function middleware(req: NextRequest, res: NextResponse) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ipAddress = req.headers.get("x-forwarded-for") ?? "";

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[Auth] ip:", ipAddress);
  
 // Get IP request count from cookies or initialize as 0
 let requestCount = Number(req.cookies.get("requestCount") ?? 0);
  
 if (!accessCode && !token) {
   
 console.log("invoke ip check...");

  // Get the current visit count for this IP or initialize it to zero
  let visitCount = Number(localStorage.getItem(ipAddress)) || 0;

  console.log("[IP Check] initial visit count:", visitCount);

  // Increment the visit count and check whether it exceeds the limit
  visitCount++;
  if (visitCount > IP_LIMIT) {
    console.log('[IP Check] IP address has reached maximum access limit');
    return NextResponse.json(
      { message: 'Too many requests from this IP address. Please try again later.' },
      { status: 401 },
    );
  }

  // Save the updated visit count in localStorage
  localStorage.setItem(ipAddress, visitCount.toString());

  console.log("[IP Check] updated visit count:", visitCount);
   



    
    
    
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
