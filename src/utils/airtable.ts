import Airtable from "airtable";
import type { FieldSet } from "airtable";
import { nanoid } from "nanoid";
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_ORDERS_TABLE_NAME, AIRTABLE_PRODUCTS_TABLE_NAME } from "astro:env/server";
import Stripe from "stripe";
import moment from "moment";

export function getAirtableBase() {
    const airtable = new Airtable({apiKey: AIRTABLE_API_KEY});
    return airtable.base(AIRTABLE_BASE_ID);
}

export async function getAirtableProducts(base: Airtable.Base, productIds: string[]) {
    const productsTable = getProductsTable(base);
    const products = await productsTable.select().all();
    return products.filter(product => productIds.indexOf(product.id) > -1);
}

export async function getAirtableOrder(base: Airtable.Base, orderId: string) {
    const orderTable = getOrdersTable(base);
    const orders = await orderTable.select({ filterByFormula: `{URL ID} = "${orderId}"` }).all();
    
    if (orders.length === 0) {
        return undefined;
    }
    
    return orders[0];
}

function getOrdersTable(base: Airtable.Base): Airtable.Table<FieldSet> {
    return base.table(AIRTABLE_ORDERS_TABLE_NAME);
}

function getProductsTable(base: Airtable.Base): Airtable.Table<FieldSet> {
    return base.table(AIRTABLE_PRODUCTS_TABLE_NAME);
}

export async function createAirtableOrder(paymentIntent: Stripe.PaymentIntent) {
    const base = getAirtableBase();
    const ordersTable = getOrdersTable(base);
    const urlId = nanoid();
    const expirationDate = moment().add(4, "weeks");
    
    try {
        await ordersTable.create([
            {
                "fields": {
                    "URL ID": urlId,
                    "Payment Intent ID": paymentIntent.id,
                    "Status": "Needs Fulfillment",
                    "Expiration Date": expirationDate.format("MM/DD/YYYY")
                }
            }
        ]);
    } catch (error) {
        console.log(error);
        throw (error);
    }
}