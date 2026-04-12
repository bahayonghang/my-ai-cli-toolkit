# API Configuration

# API Provider: google (default) | proxy
# - google: Uses Google's official Generative Language API
# - proxy: Uses a third-party proxy service
API_PROVIDER=google

# ─── Google Official API (default) ───────────────────────────
# Get your key at: https://aistudio.google.com/apikey
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY

# ─── Third-party Proxy API (alternative) ─────────────────────
# Register at your chosen proxy provider
PROXY_API_KEY=YOUR_PROXY_API_KEY
PROXY_BASE_URL=https://your-proxy-provider.example.com

# ⚠️ Security Reminder:
# - Do NOT commit secrets.md to version control
# - Add config/secrets.md to your .gitignore
# - Keep API keys confidential and rotate them regularly
