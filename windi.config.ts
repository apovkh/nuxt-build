import { defineConfig } from 'windicss/helpers'

export default defineConfig({
	preflight: false,
	extract: {
		include: ['**/*.{vue,html,jsx,tsx}'],
		exclude: ['node_modules', '.git']
	},
	theme: {
		screens: {
			sm: '560px',
			md: '768px',
			lg: '1024px',
			xl: '1340px',
			xxl: '1580px'
		}
	}
})
