<script lang="ts">
	export let skills: string[] = [],
		updateSkills: (value: string[]) => void,
		achievements: string[] = [],
		updateAchievements: (value: string[]) => void;
	let newSkill = '',
		newAchievement = '';

	const addSkill = () => {
		if(newSkill.length > 0 && !skills.includes(newSkill)) 
		updateSkills([...skills, newSkill]);
		newSkill = '';
	};
	const removeSkill = (index: number) => {
		updateSkills([...skills.slice(0, index), ...skills.slice(index + 1)]);
	};
	const addAchievement = () => {
		if(newAchievement.length > 0 && !achievements.includes(newAchievement))
		updateAchievements([...achievements, newAchievement]);
		newAchievement = '';
	};
	const removeAchievement = (index: number) => {
		updateAchievements([...achievements.slice(0, index), ...achievements.slice(index + 1)]);
	};
	const handleKeyPressSkill = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			addSkill();
		}
	};
	const handleKeyPressAchievement = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			addAchievement();
		}
	};
</script>

<div class="space-y-4">
	<h2 class="my-1 block font-bold text-xl">Skills</h2>
	<div class="flex flex-wrap gap-3">
		{#each skills as skill, index}
			<div
				class="flex items-center gap-1 rounded-md bg-blue-500 py-1 pl-3 pr-2 text-sm text-white shadow-sm"
			>
				{skill}
				<button
					class="relative rounded-full py-1 text-white hover:text-red-500 focus:outline-none"
					on:click={() => removeSkill(index)}
					aria-label="Remove skill"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 transition-transform hover:scale-110"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>

	<!-- Add Skill Input -->
	<div class="flex items-center gap-3">
		<input
			type="text"
			bind:value={newSkill}
			placeholder="Add a new skill..."
			class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
			on:keypress={handleKeyPressSkill}
		/>
		<button
			class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			on:click={addSkill}
		>
			Add
		</button>
	</div>
</div>
<div class="space-y-4 my-4">
	<h2 class="my-1 block font-bold text-xl">Achievements</h2>
	<div class="flex flex-wrap gap-3">
		{#each achievements as achievement, index}
			<div
				class="flex items-center gap-1 rounded-md bg-blue-500 py-1 pl-3 pr-2 text-sm text-white shadow-sm"
			>
				{achievement}
				<button
					class="relative rounded-full py-1 text-white hover:text-red-500 focus:outline-none"
					on:click={() => removeAchievement(index)}
					aria-label="Remove achivement"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 transition-transform hover:scale-110"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>

	<!-- Add Achievement Input -->
	<div class="flex items-center gap-3">
		<input
			type="text"
			bind:value={newAchievement}
			placeholder="Add a new achievement..."
			class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
			on:keypress={handleKeyPressAchievement}
		/>
		<button
			class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			on:click={addAchievement}
		>
			Add
		</button>
	</div>
</div>
