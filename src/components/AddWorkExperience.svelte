<script lang="ts">
	import type { WorkExperience } from '../utils/interfaces';

	export let workExperiences: Array<WorkExperience>,
		updateWorkExperiences: (value: Array<WorkExperience>) => void;

	const deleteExperience = (index: number) => {
		updateWorkExperiences(workExperiences.filter((_, i) => i !== index));
	};

	const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
		updateWorkExperiences(
			workExperiences.map((experience, i) => {
				if (i === index) {
					return {
						...experience,
						[field]: value
					};
				}
				return experience;
			})
		);
	};

	const addNewExperience = () => {
		let newExperience: WorkExperience = {
			company: '',
			position: '',
			startDate: '',
			endDate: '',
			experienceDocument: null
		};
		updateWorkExperiences([...workExperiences, newExperience]);
	};
</script>
<h2 class="my-1 block font-bold text-xl">Work Experiences</h2>
<ul role="list" class="divide-y">
	{#each workExperiences as experience, index}
		<div class="my-3 rounded-lg border-2 border-solid border-gray-400 bg-white p-4 shadow-md">
			<button
				class="border-grey-800 relative -right-7 -top-7 float-right rounded-full border bg-white p-1 text-red-500 hover:bg-red-500 hover:text-white"
				on:click={() => deleteExperience(index)}
				aria-label="Delete Experience"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<input
						type="text"
						class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={experience.company}
						on:input={(e: Event) =>
							updateExperience(index, 'company', (e.target as HTMLInputElement).value)}
						placeholder="Enter company name"
					/>
				</div>
				<div>
					<input
						type="text"
						class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={experience.position}
						on:input={(e: Event) =>
							updateExperience(index, 'position', (e.target as HTMLInputElement).value)}
						placeholder="Enter position"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="start-date" class="block text-sm font-medium text-gray-700"
							>Start Date</label
						>
						<input
							id="start-date"
							type="month"
							class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={experience.startDate}
							on:input={(e: Event) =>
								updateExperience(index, 'startDate', (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div>
						<label for="end-date" class="block text-sm font-medium text-gray-700">End Date</label>
						<input
							id="end-date"
							type="month"
							class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={experience.endDate}
							on:input={(e: Event) =>
								updateExperience(index, 'endDate', (e.target as HTMLInputElement).value)}
						/>
					</div>
				</div>
				<div>
					<label for="experience-document" class="block text-sm font-medium text-gray-700">
						Experience Document
					</label>
					<div class="relative flex">
						<input
							id="experience-document"
							type="file"
							class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							on:change={(e: Event) =>
								updateExperience(
									index,
									'experienceDocument',
									(e.target as HTMLInputElement).files?.[0] || null
								)}
						/>
						<label
							for="experience-document"
							class="block w-fit cursor-pointer rounded border border-gray-400 bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
						>
							Choose File
						</label>
						<span class="my-auto ml-2 text-sm text-gray-600">
							{experience.experienceDocument?.name ?? 'No file chosen'}
						</span>
					</div>
				</div>
			</div>
		</div>
	{/each}
</ul>
<button
	class="mx-auto flex items-center gap-2 rounded border border-gray-400 px-2 py-1"
	on:click={addNewExperience}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
	</svg>
	Add New Experience
</button>
