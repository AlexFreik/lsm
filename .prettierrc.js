module.exports = {
    printWidth: 100,
    useTabs: false,
    tabWidth: 4,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    arrowParens: 'always',
    bracketSameLine: true,
    plugins: ['prettier-plugin-tailwindcss'],
    overrides: [
        {
            files: '*.html',
            options: {
                tabWidth: 2,
                printWidth: 150,
            },
        },
    ],
};
