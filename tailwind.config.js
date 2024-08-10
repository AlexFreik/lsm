/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './gallery/**/*.{html,js}',
        './gallery-ext/**/*.{html,js}',
        './yad/**/*.{html,js}',
        './scheduler/**/*.{html,js}',
        './vmix-master/**/*.{html,js}',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
        themes: ['night'],
    },
};
