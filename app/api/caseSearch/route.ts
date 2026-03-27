import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const lst_case = searchParams.get("lst_case");
  const txtno = searchParams.get("txtno");
  const txtyear = searchParams.get("txtyear");

  const url = `https://mphc.gov.in/php/hc/casestatus/casestatus_pro.php?id=${id}&lst_case=${lst_case}&txtno=${txtno}&txtyear=${txtyear}&opt=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
        "Referer": "https://mphc.gov.in/",
        "Origin": "https://mphc.gov.in",
      }
    });

    const html = await response.text();

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch", message: error.message },
      { status: 500 }
    );
  }
}
