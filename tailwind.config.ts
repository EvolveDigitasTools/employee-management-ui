import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			boxShadow: {
				right: '3px 0 3px 0 rgba(0, 0, 0, 0.1), 2px 0 2px -1px rgba(0, 0, 0, 0.1)'
			}
		}
	},

	plugins: [typography, forms, daisyui],
	daisyui: {
		themeRoot: ".daisy-ui"
	}
} satisfies Config;
