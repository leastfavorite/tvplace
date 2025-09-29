import { after } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {

    const filePath = path.resolve("data/board.png")
    const stats = await fs.stat(filePath);
    const fileHandle = await fs.open(filePath)
    const stream = fileHandle.readableWebStream(
        { type: "bytes" }
    )

    after(() => { fileHandle.close() })
    return new Response(stream as BodyInit, {
        status: 200,
        headers: new Headers({
            "content-type": "image/png",
            "content-length": stats.size + "",
            "cache-control": "max-age=60"
        })
    })
}
