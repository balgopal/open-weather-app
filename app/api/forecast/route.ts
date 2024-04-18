import { NextRequest, NextResponse } from "next/server";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest){
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lon');

    let url = "";
    if(address){
        url = `${process.env.NEXT_PUBLIC_API}/forecast?q=${address}&appid=${process.env.NEXT_PUBLIC_API_KEY}&units=metric`;
    } else {
        url = `${process.env.NEXT_PUBLIC_API}/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_API_KEY}&units=metric`;
    }
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({ data }, { headers: corsHeaders });
}