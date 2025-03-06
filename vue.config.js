const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pwa: {
    name: 'My PWA App',  // Naziv tvoje aplikacije
    themeColor: '#4DBA87',  // Tema boje za browser
    msTileColor: '#000000',  // Boja pozadine za Windows tile
    appleMobileWebAppStatusBarStyle: 'black',  // Status bar za iOS
    manifestOptions: {
      background_color: '#42b983'  // Boja pozadine u manifestu
    }
  }
})
