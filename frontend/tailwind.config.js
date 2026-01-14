/** @type {import('tailwindcss').Config} */
// Force reload
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: 'var(--color-brand-50)',
                    100: 'var(--color-brand-100)',
                    200: 'var(--color-brand-200)',
                    300: 'var(--color-brand-300)',
                    400: 'var(--color-brand-400)',
                    500: 'var(--color-brand-500)',
                    600: 'var(--color-brand-600)',
                    700: 'var(--color-brand-700)',
                    800: 'var(--color-brand-800)',
                    900: 'var(--color-brand-900)',
                    950: 'var(--color-brand-950)',
                },
                accent: {
                    500: 'var(--color-accent-500)',
                },
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                    inverted: 'var(--text-inverted)',
                },
                border: {
                    primary: 'var(--border-primary)',
                    subtle: 'var(--border-subtle)',
                },
                surface: {
                    glass: 'var(--surface-glass)',
                },
            },
        },
    },
    plugins: [],
}
