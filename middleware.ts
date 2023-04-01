import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";



export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};

const MAX_REQUESTS = 10;

function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function counter(key: string) {
  const counter = create<>()(
    persist(
      (set, get) => (
        2
      ),
      {
        name: key,
        version: 1,
      }
    )
  );

  return counter;
}

export function middleware(req: NextRequest, res: NextResponse) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ip = req.headers.get("x-forwarded-for") ?? "";
  setItem("ip",String(ip));

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[Auth] ip:", ip);
  
 // Get IP request count from cookies or initialize as 0
 let requestCount = Number(req.cookies.get("requestCount") ?? 0);
  
 if (!accessCode && !token) {
   
  console.log("invoke ip check...");

    // Check IP request count
    if (requestCount >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "IP request limit exceeded" },
        { status: 401 }
      );
    }

    // Increment IP request count
    requestCount++;
    // Save IP request count in cookies for one hour
    req.cookies.set("requestCount", String(requestCount));
    setItem("requestCount",String(requestCount));
    counter("requestCount");

    
    
    
    
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
