import moment from "moment";
import type { OrderDownload, OrderDownloads } from "../types";
import { getAirtableBase, getAirtableOrder, getAirtableProducts } from "./airtable";
import { isDateInPast } from "./date-utils";
import config from "config";
import { readdir, stat } from "fs/promises";
import path from "path";
import mime from "mime";
import fs from "fs";
import { Readable } from "node:stream";

const orderDownloadsCache: {[orderId: string]: OrderDownloads} = {};

export async function getOrderDownloads(orderId: string): Promise<OrderDownloads | null> {
    if (orderDownloadsCache[orderId]) {
        return orderDownloadsCache[orderId];
    }
    
    const base = getAirtableBase();
    const order = await getAirtableOrder(base, orderId);
    
    if (!order) {
        return null;
    }

    const expirationDate = moment(order.get("Expiration Date") as string, "YYYY-MM-DD");
    
    if (isDateInPast(expirationDate)) {
        const orderDownloads = {
            id: orderId,
            downloads: [],
            expirationDate: expirationDate,
            isExpired: true,
        };
        orderDownloadsCache[orderId] = orderDownloads;
        
    } else {
        const productIds = order.get("Products") as string[];
        const products = await getAirtableProducts(base, productIds);
        
        const downloads: OrderDownload[] = [];
        for (const productId of productIds) {
            const product = products.find(product => product.id === productId);
            if (!product) {
                console.log("Product %s did not exist", productId);
            }

            const filename = product!.get("Filename") as string;
            
            const file = await getDownload(filename);
            if (!file) {
                console.log("File did not exist");
                return null;
            }
            downloads.push(file);
        }
        
        const orderDownloads = {
            id: orderId,
            downloads,
            expirationDate: expirationDate,
            isExpired: false
        };
        orderDownloadsCache[orderId] = orderDownloads;
    }
    
    return orderDownloadsCache[orderId];
}

export async function getDownload(filename: string): Promise<OrderDownload | undefined> {
    const basePath = config.get<string>("orderDownloadsRootPath");
    const files = await readdir(basePath);
    
    if (files.indexOf(filename) < 0) {
        return undefined;
    }
    
    const stats = await stat(path.join(basePath, filename));
    const mimeType = mime.getType(filename)!;
    
    return {
        name: filename,
        size: stats.size.toString(),
        mimeType
    };
}

export async function getDownloadStream(download: OrderDownload): Promise<ReadableStream<Uint8Array>> {
    const basePath = config.get<string>("orderDownloadsRootPath");
    const fullPath = path.join(basePath, download.name);

    // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542
    return Readable.toWeb(fs.createReadStream(fullPath)) as ReadableStream<Uint8Array>;
}