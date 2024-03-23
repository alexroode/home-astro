import { Stripe } from "stripe";

export interface ContactRequest {
    name: string;
    email: string;
    message: string;
    recaptchaResponse?: string;
}

export interface MusicLibrary {
    readonly categories: Category[];
    readonly pieces: Piece[];
}

export interface Category {
    readonly name: string;
    readonly id: string;
    readonly description: string;
}

export interface Piece {
    readonly categoryId: string;
    readonly id: string;
    readonly instrumentation: string;
    readonly subtitle: string;
    readonly title: string;
    readonly accolades?: string;
    readonly description?: string;
    readonly date: moment.Moment;
    readonly revisionDate?: moment.Moment;
    readonly duration: number;
    readonly grade?: number;
    readonly scores: Document[];
    readonly audio: AudioFile[];
    readonly performances?: Performance[];
    readonly products?: StripePriceReference[];
}

export interface Document {
    readonly url: string;
    readonly title: string;
}

export interface AudioFile {
    readonly url: string;
    readonly title: string;
}

export interface Performance {
    readonly date: moment.Moment;
    readonly venue: string;
    readonly city: string;
    readonly worldPremiere?: boolean;
    readonly performers?: string[];
    readonly youtubeVideoId?: string;
}

export interface StripePriceReference {
    readonly priceId: string;
    readonly name: string;
    readonly prod: boolean;
}

export interface Product {
    readonly id: string;
    readonly name: string;
    readonly localName: string;
    readonly description: string;
    readonly price: number;
    readonly currency: string;
  }
  
  export interface OrderConfirmation {
    readonly timestamp?: number;
    readonly total: number;
    readonly items: Stripe.LineItem[];
  }
  
  export interface OrderDownloads {
    readonly id: string;
    readonly expirationDate: moment.Moment;
    readonly downloads: OrderDownload[];
    readonly isExpired: boolean;
  }

  export interface OrderDownload {
    readonly name: string;
    readonly size: string;
    readonly mimeType: string;
  }
  