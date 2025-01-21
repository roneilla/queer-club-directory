/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		colors: {
			black: '#121212',
			white: '#fcfcfc',
			red: '#EF4349',
			orange: '#F19020',
			yellow: '#FFCB4C',
			green: '#6CAA4B',
			blue: '#55A1D8',
			purple: '#BF6BDE',
			pink: '#FB85C5',
			gray: {
				100: '#F0F0F0',
				200: '#DDDDDD',
				300: '#BBBBBB',
				400: '#AAAAAA',
				600: '#555555',
				700: '#666666',
				900: '#404040',
			},
		},
		borderRadius: {
			sm: '4px',
			DEFAULT: '12px',
			lg: '0.5rem',
			full: '500px',
		},

		extend: {},
	},
	plugins: [],
};
