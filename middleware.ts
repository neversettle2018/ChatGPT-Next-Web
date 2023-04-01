import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";



export const config = {
  matcher: ["/api/chat", "/api/chat-stream"],
};

export function middleware(req: NextRequest, res: NextResponse) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ipAddress = req.headers.get("x-forwarded-for") ?? "";

  console.log("[Auth] allowed hashed codes: ", [...ACCESS_CODES]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
    console.log("[Auth] token:", token);
  console.log("[Auth] ip:", ip);
  console.log("test limit");
    //系统配置了需要访问码才能请求
    if (ACCESS_CODES.size > 0) {
        //用户没填访问码或访问码不在系统配置列表
        if(!ACCESS_CODES.has(hashedCode) && !token){
            console.log("user accessCode is empty or  not in config ACCESS_CODES");
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
        //用户配置了正确的访问码
        if(ACCESS_CODES.has(hashedCode) ){
            console.log("test accessCode limit:");
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
            const day = currentDate.getDate().toString().padStart(2, "0");
            const currentDateStr = `${year}${month}${day}`;
            console.log("Current date:", currentDateStr);

            const accessCodeDate = accessCode?.split("_")[1];
            console.log("Access code date:", accessCodeDate);
            console.log("accessCodeDate > currentDate:", accessCodeDate > currentDateStr);
            //访问码过期了
            if (accessCodeDate > currentDateStr) {
                console.log("Access code has expired");
                return NextResponse.json(
                    { error: "Access code has expired" },
                    { status: 401 }
                );
            }
        }
    }

  return NextResponse.next();
}
