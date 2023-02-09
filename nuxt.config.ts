export default defineNuxtConfig({
	srcDir: './src',
	modules: [
		'nuxt-windicss'
	],
	css: [
		'vuetify/lib/styles/main.sass',
		'@mdi/font/css/materialdesignicons.min.css'
	],
	build: {
		transpile: ['vuetify']
	},
	vite: {
		define: {
			'process.env.DEBUG': false
		}
	}
})
