import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { place, courts } = await req.json();

    const resp = await fetch("https://mphc.gov.in/php/hc/front/getboardsr.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://mphc.gov.in/online-display-board",
        "Origin": "https://mphc.gov.in",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: new URLSearchParams({
        place,
        courts,
      }).toString(),
    });

    const html = await resp.text();

    return NextResponse.json({
      success: true,
      html,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
