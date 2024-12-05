/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.html",
        "./src/**/*.ts",
    ],
    theme: {
        extend: {
            fontFamily: {
                "source-code": ["\"Source Code Pro\"", "monospace"],
            },
        },
    },
    plugins: [],
};

