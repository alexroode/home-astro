import moment from "moment";
import type { MusicLibrary, Piece, Category, Performance } from "../types.js";
import musicJson from "./music.json";

function notFound(): Promise<any> {
    return Promise.reject(null);
}

function mapJsonDate(dateString: string): moment.Moment;
function mapJsonDate(dateString?: string): moment.Moment | undefined;

function mapJsonDate(dateString?: string): moment.Moment | undefined {
    if (!dateString) {
        return undefined;
    }
    return moment(dateString, "YYYY/MM/DD");
}

export class MusicService {
    private music: MusicLibrary = {
        categories: musicJson.categories,
        pieces: musicJson.pieces.map(piece => ({
            ...piece,
            date: mapJsonDate(piece.date),
            revisionDate: mapJsonDate(piece.revisionDate),
            performances: piece.performances?.map(performance => ({
                ...performance,
                date: mapJsonDate(performance.date)
            }))
        }))
    }
    
    private sortPieces(a: Piece, b: Piece): number {
        const aDate = a.revisionDate || a.date;
        const bDate = b.revisionDate || b.date;
        return bDate.diff(aDate);
    }
    
    async getLibrary(): Promise<MusicLibrary> {
        return Promise.resolve(this.music);
    }
    
    async getInCategory(categoryId: string): Promise<Piece[]> {
        const library = await this.getLibrary();
        const pieces = library.pieces
            .filter(p => p.categoryId === categoryId)
            .sort(this.sortPieces);
        return pieces;
    }
    
    async findCategory(id: string): Promise<Category> {
        const library = await this.getLibrary();
        const category = library.categories.find(c => c.id === id);
        if (category) {
            return category;
        }
        return notFound();
    }
    
    async findPiece(id: string, categoryId: string): Promise<Piece> {
        const library = await this.getLibrary();
        const piece = library.pieces.find(p => p.id === id && p.categoryId === categoryId);
        if (piece) {
            return piece;
        }
        return notFound();
    }
    
    async getLatest(count: number): Promise<Piece[]> {
        const library = await this.getLibrary();
        return [...library.pieces]
            .sort(this.sortPieces)
            .slice(0, count);
    }

    async getUpcomingPerformances(): Promise<{ piece: Piece, performance: Performance}[]> {
        const library = await this.getLibrary();
        const now = moment().subtract(1, 'day');

        return library.pieces.flatMap(piece => piece.performances
            ?.filter(performance => performance.date.diff(now) > 0)
            .map(performance => ({ performance, piece })) 
            || []
        );
    }
}

export const Music = new MusicService();