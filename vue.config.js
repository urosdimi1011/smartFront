const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  pwa: {
    name: "KlikControl",
    short_name: "KlikControl",
    display: "standalone",
    themeColor: "#00293E",
    msTileColor: "#000000",
    iconPaths: {
      favicon32: "img/icons/icon-32x32.png",
      favicon16: "img/icons/icon-16x16.png",
      appleTouchIcon: "img/icons/icon-152x152.png",
      maskIcon: "img/icons/icon-192x192.png",
      msTileImage: "img/icons/icon-144x144.png",
    },
    appleMobileWebAppStatusBarStyle: "black",
    manifestOptions: {
      background_color: "#00293E",
    },
    workboxOptions: {
      skipWaiting: false,
      clientsClaim: true,
    },
  },
});
