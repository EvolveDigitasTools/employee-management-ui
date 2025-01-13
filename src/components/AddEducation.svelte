<script lang="ts">
	import type { Education } from '../utils/interfaces';

	export let educationDetails: Array<Education>,
		updateEducationDetails: (value: Array<Education>) => void;

	const deleteEducation = (index: number) => {
		updateEducationDetails(educationDetails.filter((_, i) => i !== index));
	};

	const updateEducation = (index: number, field: keyof Education, value: any) => {
		updateEducationDetails(
			educationDetails.map((education, i) => {
				if (i === index) {
					return {
						...education,
						[field]: value
					};
				}
				return education;
			})
		);
	};

	const addNewEducation = () => {
		let newEducation: Education = {
			level: '',
			institution: '',
			startYear: 2020,
			grade: '',
			educationDocument: null
		};
		updateEducationDetails([...educationDetails, newEducation]);
	};
</script>

<ul role="list" class="divide-y">
	{#each educationDetails as education, index}
		<div class="my-3 rounded-lg border-2 border-solid border-gray-400 bg-white p-4 shadow-md">
			<button
				class="border-grey-800 relative -right-7 -top-7 float-right rounded-full border bg-white p-1 text-red-500 hover:bg-red-500 hover:text-white"
				on:click={() => deleteEducation(index)}
				aria-label="Delete Education"
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
						value={education.level}
						on:input={(e: Event) =>
							updateEducation(index, 'level', (e.target as HTMLInputElement).value)}
						placeholder="Enter education level like Class X, XII, etc."
					/>
				</div>
				<div>
					<input
						type="text"
						class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={education.institution}
						on:input={(e: Event) =>
							updateEducation(index, 'institution', (e.target as HTMLInputElement).value)}
						placeholder="Enter institution like school, college, etc."
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="start-year" class="block text-sm font-medium text-gray-700"
							>Education Start Year</label
						>
						<input
							id="start-year"
							type="year"
							class="w-full rounded border border-gray-400 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={education.startYear}
							on:input={(e: Event) =>
								updateEducation(index, 'startYear', (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div>
						<label for="end-year" class="block text-sm font-medium text-gray-700"
							>End Year(if applicable)</label
						>
						<input
							id="end-year"
							type="year"
							class="w-full rounded border border-gray-400 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={education.endYear}
							on:input={(e: Event) =>
								updateEducation(index, 'endYear', (e.target as HTMLInputElement).value)}
						/>
					</div>
				</div>

				<div>
					<label for="experience-document" class="block text-sm font-medium text-gray-700">
						Certificate or Completion Document
					</label>
					<div class="relative flex">
						<input
							id="experience-document"
							type="file"
							class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							on:change={(e: Event) =>
								updateEducation(
									index,
									'educationDocument',
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
							{education.educationDocument?.name ?? 'No file chosen'}
						</span>
					</div>
				</div>
				<div>
					<input
						type="text"
						class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={education.grade}
						on:input={(e: Event) =>
							updateEducation(index, 'grade', (e.target as HTMLInputElement).value)}
						placeholder="Enter grade or percentage whatever applicable"
					/>
				</div>
				<div>
					<input
						type="text"
						class="w-full rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={education.specialization}
						on:input={(e: Event) =>
							updateEducation(index, 'specialization', (e.target as HTMLInputElement).value)}
						placeholder="Enter specialization(if any)"
					/>
				</div>
			</div>
		</div>
	{/each}
</ul>
<button
	class="mx-auto flex items-center gap-2 rounded border border-gray-400 px-2 py-1"
	on:click={addNewEducation}
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
	Add New Education
</button>
