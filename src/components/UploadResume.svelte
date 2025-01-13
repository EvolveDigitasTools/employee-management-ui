<script lang="ts">
	import { getSizeInWords } from '../utils/utils';

	export let uploadResume, resumeDocument;
	let error: string;

	const uploadResumeDocument = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file && file.size <= 2 * 1024 * 1024) {
			uploadResume(file);
			error = '';
		} else {
			error = 'File size exceeds 2MB';
		}
	};
</script>

<label for="resume" class="mb-4 block text-lg font-medium text-gray-900">Add Resume</label>
<div id="resume" class="rounded-lg border border-dashed border-gray-900/25 bg-gray-50">
	<div class="mt-2 flex justify-center px-6 py-10">
		<div class="text-center">
			<svg
				class="mx-auto size-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 16v4a2 2 0 002 2h14a2 2 0 002-2v-4m-4-4L12 3m0 0L7 12m5-9v12"
				></path>
			</svg>
			<div class="mt-4 flex justify-center text-sm/6 text-gray-600">
				<label
					for="file-upload"
					class="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
				>
					<span>Upload a file</span>
					<input
						id="file-upload"
						name="file-upload"
						accept=".pdf,.docx"
						type="file"
						class="sr-only"
						on:change={uploadResumeDocument}
					/>
				</label>
			</div>
			<p class="text-xs/5 text-gray-600">PDF, DOCX up to 2MB</p>
		</div>
	</div>
	{#if resumeDocument}
		<div class="flex items-center justify-between rounded-b-lg bg-white py-4 pl-4 pr-5 text-sm/6">
			<div class="flex w-0 flex-1 items-center">
				<svg
					class="size-5 shrink-0 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="ml-4 flex min-w-0 flex-1 gap-2">
					<span class="truncate font-medium">{resumeDocument.name}</span>
					<span class="shrink-0 text-gray-400">{getSizeInWords(resumeDocument.size)}</span>
				</div>
			</div>
		</div>
	{/if}
</div>
{#if error}
	<p class="mt-2 text-red-500">{error}</p>
{/if}
