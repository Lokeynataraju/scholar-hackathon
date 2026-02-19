/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#2563eb",
                    "primary-content": "#ffffff",
                    "secondary": "#06b6d4",
                    "secondary-content": "#ffffff",
                    "accent": "#6366f1",
                    "accent-content": "#ffffff",
                    "neutral": "#1e293b",
                    "neutral-content": "#f1f5f9",
                    "base-100": "#ffffff",
                    "base-200": "#f0f6ff",
                    "base-300": "#e0eeff",
                    "base-content": "#0f172a",
                    "info": "#0ea5e9",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                },
                dark: {
                    "primary": "#3b82f6",
                    "primary-content": "#ffffff",
                    "secondary": "#06b6d4",
                    "secondary-content": "#ffffff",
                    "accent": "#818cf8",
                    "accent-content": "#ffffff",
                    "neutral": "#1e293b",
                    "neutral-content": "#f1f5f9",
                    "base-100": "#0f172a",
                    "base-200": "#1e293b",
                    "base-300": "#020617",
                    "base-content": "#f8fafc",
                    "info": "#0ea5e9",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                }
            }
        ],
    },
}
