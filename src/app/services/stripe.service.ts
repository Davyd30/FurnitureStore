import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CartItem } from './cart.service';
import { User } from '../models/user.interface';

export interface CheckoutSessionRequest {
    items: CartItem[];
    user: User;
    currency: string;
}

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private stripePromise: Promise<Stripe | null> = loadStripe(
        'pk_test_51Sz312JCjb5KbZeMpthDU3s61KbxrJn3U44g7b6L5d6xrOu5p5PjSlTMLUCXSBGfy4gJT2tOdJaOBzv8M2xUQawq00Eq0MlB6s'
    );

    async checkout(request: CheckoutSessionRequest): Promise<void> {
        // Build form data for Stripe API
        const formData = new URLSearchParams();
        formData.append('mode', 'payment');
        formData.append('success_url', `${window.location.origin}/success`);
        formData.append('cancel_url', `${window.location.origin}/cancel`);
        formData.append('customer_email', request.user.email || '');
        formData.append('client_reference_id', request.user._id || '');

        // Add line items
        request.items.forEach((item, index) => {
            formData.append(`line_items[${index}][price_data][currency]`, (request.currency || 'usd').toLowerCase());
            formData.append(`line_items[${index}][price_data][product_data][name]`, item.name || 'Product');
            formData.append(`line_items[${index}][price_data][unit_amount]`, Math.round(item.price * 100).toString());
            formData.append(`line_items[${index}][quantity]`, item.quantity.toString());
        });

        // Create session
        const secretKey = 'sk_test_51Sz312JCjb5KbZeMDljgNWRksQQwRVVwdPnQRRXmztNBcpLJbWPJmdB7BEsx1393yEqa1Vusrae8IN0LLFwqBtIX00Ni79CbSy';
        
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Stripe API error (${response.status}): ${errorText}`);
        }


        const session = await response.json();
        
        // Redirect to Stripe-hosted checkout page
        if (session.url) {
            window.location.href = session.url;
        } else {
            throw new Error('No checkout URL returned from Stripe API');
        }
    }
}
