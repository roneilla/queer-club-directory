/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		borderRadius: {
			sm: '4px',
			DEFAULT: '24px',
			lg: '0.5rem',
			full: '500px',
		},
		extend: {},
	},
	plugins: [],
};
