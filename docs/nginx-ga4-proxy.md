# Nginx Reverse Proxy Configuration for GA4

To track users in China reliably, you can route Google Analytics 4 (GA4) traffic through an Nginx reverse proxy hosted on a domain accessible in China.

## Prerequisites

- A server with Nginx installed (outside of China, or with stable access to Google servers).
- A domain name pointing to your Nginx server (e.g., `analytics.yourdomain.com` or just using your main domain with a specific path).
- SSL certificate (HTTPS) is highly recommended.

## Nginx Configuration

Add the following block to your Nginx server configuration (usually in `/etc/nginx/sites-available/default` or similar):

```nginx
location /ga/ {
    # Proxy the Google Analytics script (gtag.js)
    location /ga/js {
        proxy_pass https://www.googletagmanager.com/gtag/js;
        proxy_set_header Host www.googletagmanager.com;
        proxy_ssl_server_name on;

        # Cache configuration (optional but recommended for performance)
        proxy_buffering on;
        proxy_cache_valid 200 1h;
        expires 1h;
    }

    # Proxy the data collection endpoint
    location /ga/collect {
        proxy_pass https://www.google-analytics.com/g/collect;
        proxy_set_header Host www.google-analytics.com;
        proxy_ssl_server_name on;

        # Forward the user's IP address
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## How it works

1.  **Script Proxy**: Requests to `/ga/js` on your server are forwarded to `https://www.googletagmanager.com/gtag/js`.
2.  **Collection Proxy**: Requests to `/ga/collect` on your server are forwarded to `https://www.google-analytics.com/g/collect`.
3.  **Headers**: We set the `Host` header so Google's servers accept the request, and forward the client's IP so GA4 sees the user's IP (partial success depending on privacy settings).

## Client-Side Update

You need to update your client-side code to use these new endpoints.

In `src/lib/analytics.ts`:

```typescript
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-BBQ1PPGCCE";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    // Point to your proxy for the script
    gtagUrl: "/ga/js",
    // Configure the tracker to send data to your proxy
    gtagOptions: {
      transport_url: "/ga/collect",
    },
  });
};
```

> [!NOTE]
> Ensure that the path `/ga/` in your client code matches the `location` block in your Nginx config.
