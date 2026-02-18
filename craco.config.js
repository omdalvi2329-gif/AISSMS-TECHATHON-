module.exports = {
  style: {
    postcss: {
      plugins: [require('@tailwindcss/postcss'), require('autoprefixer')]
    }
  },
  devServer: {
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },
};
