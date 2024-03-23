import React from "react";
import type { ReactNode } from "react";
import { CartProvider } from "use-shopping-cart";
import Cart from "./Cart";
import CartSummary from "./CartSummary";
import AddToCart from "./AddToCart";
import OrderConfirmation from "./OrderConfirmation";
import LoadingIndicator from "./LoadingIndicator";

const cartContents = document.getElementById("cart-contents");
const addToCart = document.getElementById("add-to-cart");
const orderConfirmation = document.getElementById("order-confirmation");

let addToCartNode: ReactNode = null;
if (addToCart) {
    const productId = addToCart.getAttribute("data-product-id")!;
    addToCartNode = <AddToCart productId={productId} />;
}

interface EcommerceAppProps {
    stripePublishableKey: string;
}

export default ({stripePublishableKey}: EcommerceAppProps) => {
    return <React.StrictMode>
        <CartProvider
            cartMode="checkout-session"
            stripe={stripePublishableKey}
            currency="USD"
            loading={<LoadingIndicator />}
            shouldPersist={true}
        >
            {addToCartNode}
            {cartContents ? <Cart /> : null}
            {cartContents ? null : <CartSummary />}
            {orderConfirmation ? <OrderConfirmation /> : null}
        </CartProvider>
    </React.StrictMode>;
};