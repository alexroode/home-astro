import type { APIRoute } from "astro";
import { getDownloadStream, getOrderDownloads } from "../../utils/order-downloads";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const orderId = url.searchParams.get("orderId");
    const downloadIdString = url.searchParams.get("downloadId");

    if (!orderId || !downloadIdString) {
        return new Response(null, { status: 404 });
    }

    const downloadId = Number.parseInt(downloadIdString, 10);
    const orderDownloads = await getOrderDownloads(orderId);

    if (Number.isNaN(downloadId) || !orderDownloads || downloadId > orderDownloads.downloads.length) {
        return new Response(null, { status: 404 });
    }

    const download = orderDownloads.downloads[downloadId - 1];
    const stream = await getDownloadStream(download);

    console.log(download);

    const response = new Response(new ReadableStream(stream), { 
        status: 200,
        headers: {
            "Content-Type": download.mimeType,
            "Content-disposition": "attachment; filename=" + download.name,
            "Transfer-Encoding": "chunked"
        }
    });
    //response.headers.append("Content-Type", download.mimeType);
    //response.headers.append("Content-disposition", "attachment; filename=" + download.name);
    //response.headers.append("Transfer-Encoding", "chunked");

    return response;
}