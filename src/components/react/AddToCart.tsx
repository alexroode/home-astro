import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import type { Product } from "../../types";
import { useShoppingCart } from "use-shopping-cart";
import { formatCurrencyString } from "use-shopping-cart";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "./LoadingIndicator";

interface ProductProps {
    productId: string;
}

const el = document.getElementById("add-to-cart");

export default ({ productId }: ProductProps) => {
    const { addItem, cartDetails } = useShoppingCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    async function loadProduct() {
        try {
            const response = await fetch("/api/product/" + productId);
            const product = await response.json();
            setProduct(product);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadProduct();
    }, []);

    if (!product || !cartDetails) {
        return null;
    }

    if (!el) {
        return;
    }

    const alreadyInCart = product && cartDetails[product.id] && cartDetails[product.id].quantity > 0;

    return ReactDOM.createPortal(
        <div>
            {error ? <ErrorMessage error={error} onRetry={() => loadProduct()} /> : <>
                {isLoading ? <LoadingIndicator /> : <>
                    <div className="d-sm-flex align-items-center">
                        <div className="flex-grow-1 my-3">
                            <span className="mb-0 me-3">{product.localName}</span>
                            <span className="font-weight-bold">{formatCurrencyString({ value: product.price, currency: product.currency })}</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            disabled={alreadyInCart}
                            onClick={() => addItem(product)}
                        >
                            {alreadyInCart ? "Added to cart" : "Add to cart"}
                        </button>
                    </div>
                </>}
            </>}
        </div>,
        el
    );
};