<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getSizeInWords, isTokenVerified, onboardingLevels } from '../../../utils/utils';
	import type { EmployeeDetails, EmployeeDetailsExtracted } from '../../../utils/interfaces';
	import { Home, Icon } from 'svelte-hero-icons';

	// Local state for the form
	let token: string;
	let employeeDetails: EmployeeDetails = {
		name: '',
		email: '',
		phone: '',
		skills: [],
		workExperiences: [],
		education: [],
		achievements: [],
		department: '',
		position: '',
		dateJoined: '',
		aadharDocument: null,
		panDocument: null,
		resumeDocument: null,
		profileImg: null
	};
	let error = '';
	let newSkill = '';
	let newAchievement = '';
	let submitEnabled: boolean = false;
	let onboardingLevelsStatus = onboardingLevels.map(() => false);
	let activeLevel = 0;
	let profileImgURL: string | null = null;
	let fileInput: HTMLInputElement | null = null;

	onMount(async () => {
		try {
			token = localStorage.getItem('token') || '';

			if (!(await isTokenVerified(token ?? ''))) {
				// If there's no token, redirect to login page
				goto('/login');
			}
		} catch (error) {
			console.error('Error fetching employees:', error);
		}
	});

	const updateProgress = () => {
		if (activeLevel == 0) {
			submitEnabled = !!employeeDetails.resumeDocument;
		} else if (activeLevel == 1) {
			submitEnabled =
				!!employeeDetails.name &&
				employeeDetails.name.length > 0 &&
				!!employeeDetails.email &&
				employeeDetails.email.length > 0 &&
				!!employeeDetails.phone &&
				employeeDetails.phone.length > 0 &&
				!!employeeDetails.profileImg;
		} else {
			submitEnabled = false;
		}
	};

	const updateEmployeeDetails = (updatedEmployeeDetails: EmployeeDetails) => {
		employeeDetails = updatedEmployeeDetails;
		updateProgress();
	};

	// Resume submission and parsing
	const submitResume: () => Promise<boolean> = async () => {
		if (!employeeDetails.resumeDocument) {
			error = 'Please upload a resume.';
			return false;
		}

		error = '';
		const formData = new FormData();
		formData.append('file', employeeDetails.resumeDocument);

		try {
			const res = await fetch(import.meta.env.VITE_API_URL + '/parsing/get-resume-details', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data: EmployeeDetailsExtracted = await res.json();
			console.log('data: ', data);

			// Autofill details if available
			employeeDetails = {
				...employeeDetails,
				...data,
				workExperiences:
					data.workExperiences?.map((experience) => {
						return {
							company: experience.company ?? '',
							position: experience.position ?? '',
							startDate: experience.startDate ?? '',
							endDate: experience.endDate ?? '',
							experienceDocument: null
						};
					}) || [],
				education:
					data.education?.map((education) => {
						return {
							...education,
							level: education.level ?? '',
							institution: education.institution ?? '',
							startYear: education.startYear ?? 0,
							grade: education.grade ?? ''
						};
					}) || []
			};
			return true;
		} catch (err) {
			error = 'Failed to parse the resume. Please fill the details manually.';
			// const testData: EmployeeDetails = {
			// 	name: 'Jatin Aggarwal',
			// 	email: 'jatin.aggarwal@gmail.com',
			// 	phone: {
			// 		prefix: '91',
			// 		number: '9999999999'
			// 	},
			// 	skills: ['Python', 'JavaScript'],
			// 	workExperiences: [
			// 		{
			// 			company: 'ABC Company',
			// 			position: 'Software Engineer',
			// 			startDate: {
			// 				month: 7,
			// 				year: 2021
			// 			},
			// 			endDate: {
			// 				month: 12,
			// 				year: 2022
			// 			},
			// 			experienceDocument: null
			// 		}
			// 	],
			// 	education: [
			// 		{
			// 			level: 'Class X',
			// 			institution: 'ABC School',
			// 			startYear: 2014,
			// 			grade: '8.2 CGPA'
			// 		},
			// 		{
			// 			level: 'Class XII',
			// 			institution: 'ABC School',
			// 			startYear: 2016,
			// 			grade: '76.8%',
			// 			specialization: 'Science'
			// 		},
			// 		{
			// 			level: 'B.Tech',
			// 			institution: 'ABC University',
			// 			startYear: 2017,
			// 			endYear: 2021,
			// 			grade: '6.8 SGPA',
			// 			specialization: 'Computer Science'
			// 		}
			// 	],
			// 	achievements: ['Certificate of Completion of Java course'],
			// 	aadharDocument: null,
			// 	panDocument: null
			// };
			// employeeDetails = {
			// 	...employeeDetails,
			// 	...testData
			// };
			// resumeSubmitted = true;
			console.error(err);
			return false;
		}
	};

	const submitSteps = async () => {
		try {
			let result = false;
			switch (activeLevel) {
				case 0:
					result = await submitResume();
					break;
				case 1:
					result = true;
					break;
				default:
					break;
			}

			if (result) {
				onboardingLevelsStatus[activeLevel] = true;
				activeLevel++;
				updateProgress();
			}
		} catch (err) {
			error = 'An error occurred while submitting the form.';
			console.error(err);
		}
	};

	// Submit the complete form
	const submitForm = async () => {
		try {
			const res = await fetch(import.meta.env.VITE_API_URL + '/employee/new', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(employeeDetails)
			});
			if (res.ok) {
				goto('/employees'); // Redirect to the homepage on success
			} else {
				error = 'Failed to submit the details. Please try again.';
			}
		} catch (err) {
			error = 'An error occurred while submitting the form.';
			console.error(err);
		}
	};

	const addNewEmployee = async () => {
		alert('new employee created successfully');
		// 	try {
		// 		if()
		// 	} catch (err) {
		// 		console.error(err);
		// 		alert("Employee creation failed. Please try again or contact admin")
		// 	}
	};

	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			employeeDetails.profileImg = file;
			updateProgress();
			const reader = new FileReader();
			reader.onload = () => {
				profileImgURL = reader.result as string; // Store the data URL
			};
			reader.readAsDataURL(file); // Convert file to data URL
		}
	};

	$: updateProgress();
</script>

<header class="flex h-[12%] justify-start border-b-2 bg-white">
	<button on:click={() => goto('/')} class="w-28 pl-16 pr-6 shadow-right">
		<Icon src={Home} solid />
	</button>
	<div class="my-auto max-w-7xl px-8">
		<h1 class="text-3xl font-bold tracking-tight text-gray-900">Employee Onboarding</h1>
	</div>
</header>
<div class="container mx-auto grid h-[88%] w-full grid-cols-3 gap-x-8 bg-gray-50 px-8 py-4">
	<div class="daisy-ui h-full p-2">
		<ul class="steps steps-vertical">
			{#each onboardingLevelsStatus as levelStatus, i}
				<li
					data-content={i == activeLevel ? '●' : levelStatus ? '✓' : ''}
					class={`step ${i == activeLevel ? 'step-active step-info' : levelStatus ? 'step-info' : 'step-inactive'} text-left font-sans text-sm`}
				>
					<div>
						<div class="text-left font-sans text-sm text-black">{onboardingLevels[i].title}</div>
						<div class="text-left font-sans text-sm text-gray-500">
							{onboardingLevels[i].description}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
	<div class="col-span-2 h-full rounded-xl border-2 border-solid bg-white p-8">
		<div class="h-[90%]">
			{#if activeLevel == 0}
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
										on:change={(e: Event) =>
											updateEmployeeDetails({
												...employeeDetails,
												resumeDocument: (e.target as HTMLInputElement).files?.[0] || null
											})}
									/>
								</label>
							</div>
							<p class="text-xs/5 text-gray-600">PDF, DOCX up to 2MB</p>
						</div>
					</div>
					{#if employeeDetails.resumeDocument}
						<div
							class="flex items-center justify-between rounded-b-lg bg-white py-4 pl-4 pr-5 text-sm/6"
						>
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
									<span class="truncate font-medium">{employeeDetails.resumeDocument.name}</span>
									<span class="shrink-0 text-gray-400"
										>{getSizeInWords(employeeDetails.resumeDocument.size)}</span
									>
								</div>
							</div>
						</div>
					{/if}
				</div>
				{#if error}
					<p class="mt-2 text-red-500">{error}</p>
				{/if}
			{/if}
			{#if activeLevel == 1}
				<div class="flex flex-col justify-start gap-4">
					<div>
						<label for="employee-photo" class="block text-sm/6 font-medium text-gray-900"
							>Employee Photo</label
						>
						<div id="employee-photo" class="mt-2 flex items-center gap-x-3">
							{#if profileImgURL}
								<img
									class="h-12 w-12 rounded-full object-cover"
									src={profileImgURL}
									alt="employee dp"
								/>
							{:else}
								<svg
									class="size-12 text-gray-300"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									data-slot="icon"
								>
									<path
										fill-rule="evenodd"
										d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
							<input
								type="file"
								accept="image/*"
								bind:this={fileInput}
								on:change={handleFileChange}
								style="display: none"
							/>
							<button
								type="button"
								class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
								on:click={() => fileInput?.click()}>Change</button
							>
						</div>
					</div>
					<div>
						<label for="name" class="block text-sm/6 font-medium text-gray-900">Name</label>
						<div class="mt-2">
							<input
								type="text"
								name="name"
								id="name"
								autocomplete="given-name"
								placeholder="Enter your name"
								class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								bind:value={employeeDetails.name}
								on:change={updateProgress}
							/>
						</div>
					</div>
					<div>
						<label for="email" class="block text-sm/6 font-medium text-gray-900"
							>Email address</label
						>
						<div class="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								placeholder="you@example.com"
								class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								bind:value={employeeDetails.email}
								on:change={updateProgress}
							/>
						</div>
					</div>
					
					<div>
						<label for="phone-number" class="block text-sm/6 font-medium text-gray-900"
							>Phone Number</label
						>
						<div class="mt-2">
							<input
								id="phone-number"
								name="email"
								type="email"
								autocomplete="email"
								placeholder="you@example.com"
								class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								bind:value={employeeDetails.phone}
								on:change={updateProgress}
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="flex h-[10%] items-end justify-end gap-x-6 border-t">
			<button
				type="submit"
				disabled={submitEnabled ? false : true}
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-500"
				on:click={submitSteps}>Submit{submitEnabled ? '' : ' (enter all details)'}</button
			>

		</div>
	</div>

	<!-- {#if !resumeSubmitted}
		<div class="mx-auto max-w-lg rounded-md border-2 border-gray-300 p-4 shadow-md">
			<h2 class="mb-4 text-center text-2xl font-bold">Upload Your Resume</h2>
			<form class="space-y-4">
				<div>
					<label for="resume" class="block text-sm font-medium text-gray-700"
						>Choose a file (.pdf, .docx accepted)</label
					>
					<input
						id="resume"
						type="file"
						accept=".pdf,.docx"
						class="mt-2 w-full rounded border p-2"
						on:change={(e: Event) =>
							(employeeDetails.resumeDocument = (e.target as HTMLInputElement).files?.[0] || null)}
					/>
				</div>
				<div class="text-center">
					<button
						type="submit"
						class="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
						on:click={submitResume}>Upload Resume</button
					>
				</div>
			</form>
			{#if error}
				<p class="mt-2 text-red-500">{error}</p>
			{/if}
		</div>
	{/if} -->

	<!-- Employee Details Form -->
	{#if false}
		<form on:submit|preventDefault={submitForm} class="space-y-4">
			<div>
				<label for="name" class="block font-bold">Name:</label>
				<input
					id="name"
					type="text"
					required
					bind:value={employeeDetails.name}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="email" class="block font-bold">Email:</label>
				<input
					id="email"
					type="email"
					required
					bind:value={employeeDetails.email}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="phone" class="block font-bold">Phone:</label>
				<input
					id="phone"
					type="tel"
					required
					bind:value={employeeDetails.phone}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="skills" class="mb-2 block font-bold">Skills:</label>
				<div id="skills" class="mb-4 flex flex-wrap gap-2">
					{#each employeeDetails.skills as skill}
						<div class="flex items-center rounded-md bg-blue-500 px-3 py-1 text-white">
							<span class="mr-2">{skill}</span>
							<button
								type="button"
								class="text-red-300 hover:text-red-500 focus:outline-none"
								on:click={() => {
									employeeDetails.skills = employeeDetails.skills.filter((s) => s !== skill);
								}}
							>
								x
							</button>
						</div>
					{/each}
				</div>
				<div class="flex items-center gap-2">
					<input
						type="text"
						placeholder="Add a skill"
						class="w-full rounded-md border border-gray-300 p-2"
						bind:value={newSkill}
					/>
					<button
						type="button"
						class="rounded-md bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
						on:click={() => {
							if (newSkill.length > 0)
								employeeDetails.skills = [...employeeDetails.skills, newSkill];
							newSkill = '';
						}}
					>
						Add
					</button>
				</div>
			</div>

			<div>
				<label for="work-experiences" class="block font-bold">Work Experience:</label>
				{#each employeeDetails.workExperiences as work, index}
					<div class="mb-2">
						<input
							type="text"
							placeholder="Company Name"
							required
							bind:value={work.company}
							class="w-full rounded-md border border-gray-300 p-2"
						/>
						<input
							type="text"
							placeholder="Position"
							required
							bind:value={work.position}
							class="mt-2 w-full rounded-md border border-gray-300 p-2"
						/>
						<input
							type="month"
							placeholder="Start Date"
							required
							bind:value={work.startDate}
							class="mt-2 w-full rounded-md border border-gray-300 p-2"
						/>
						<input
							type="month"
							placeholder="End Date"
							required
							bind:value={work.endDate}
							class="mt-2 w-full rounded-md border border-gray-300 p-2"
						/>
						<input
							type="file"
							placeholder="Enter Experience Document like Relieving Letter"
							required
							bind:value={work.experienceDocument}
							class="mt-2 w-full rounded-md border border-gray-300 p-2"
						/>
						<button
							type="button"
							on:click={() => employeeDetails.workExperiences.splice(index, 1)}
							class="mt-2 text-red-500 hover:underline"
						>
							Remove
						</button>
					</div>
				{/each}
				<button
					type="button"
					id="work-experiences"
					on:click={() => {
						// Add a new work experience object to the array
						employeeDetails.workExperiences = [
							...employeeDetails.workExperiences,
							{
								company: '',
								position: '',
								startDate: '',
								endDate: '',
								experienceDocument: null
							}
						];
					}}
					class="mt-2 rounded-md bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
				>
					Add Work Experience
				</button>
			</div>

			<div>
				<label for="education" class="block font-bold">Education:</label>
				{#each employeeDetails.education as education, index}
					<div class="mb-2">
						<div>
							<label for="level" class="block font-bold">Level:</label>
							<input
								type="text"
								required
								placeholder="Class X, XII or Under Grad or Post Grad"
								bind:value={education.level}
								class="w-full rounded-md border border-gray-300 p-2"
							/>
						</div>
						<div>
							<label for="institution" class="block font-bold">institution:</label>
							<input
								type="text"
								placeholder="Add Institution"
								required
								bind:value={education.institution}
								class="mt-2 w-full rounded-md border border-gray-300 p-2"
							/>
						</div>
						<div>
							<label for="start-year" class="block font-bold">Start Year:</label>
							<input
								type="number"
								placeholder="Enter Education Start Year"
								required
								bind:value={education.startYear}
								class="mt-2 w-full rounded-md border border-gray-300 p-2"
							/>
						</div>
						<div>
							<label for="institution" class="block font-bold">End Year:</label>
							<input
								type="number"
								placeholder="Enter Education End Year(if applicable)"
								bind:value={education.institution}
								class="mt-2 w-full rounded-md border border-gray-300 p-2"
							/>
						</div>
						<button
							id="education"
							type="button"
							on:click={() => employeeDetails.education.splice(index, 1)}
							class="mt-2 text-red-500 hover:underline"
						>
							Remove
						</button>
					</div>
				{/each}
				<button
					type="button"
					on:click={() => {
						// Add a new work experience object to the array
						employeeDetails.education = [
							...employeeDetails.education,
							{
								level: '',
								institution: '',
								startYear: 2020,
								grade: '',
								specialization: ''
							}
						];
					}}
					class="mt-2 rounded-md bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
				>
					Add Education
				</button>
			</div>

			<div>
				<label for="achievements" class="mb-2 block font-bold">Achievements:</label>
				<div id="achievements" class="mb-4 flex flex-wrap gap-2">
					{#each employeeDetails.achievements as achievement}
						<div class="flex items-center rounded-md bg-blue-500 px-3 py-1 text-white">
							<span class="mr-2">{achievement}</span>
							<button
								type="button"
								class="text-red-300 hover:text-red-500 focus:outline-none"
								on:click={() => {
									employeeDetails.achievements = employeeDetails.achievements.filter(
										(s) => s !== achievement
									);
								}}
							>
								x
							</button>
						</div>
					{/each}
				</div>
				<div class="flex items-center gap-2">
					<input
						type="text"
						placeholder="Add a Achievement"
						class="w-full rounded-md border border-gray-300 p-2"
						bind:value={newAchievement}
					/>
					<button
						type="button"
						class="rounded-md bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600"
						on:click={() => {
							if (newAchievement.length > 0)
								employeeDetails.achievements = [...employeeDetails.achievements, newAchievement];
							newAchievement = '';
						}}
					>
						Add
					</button>
				</div>
			</div>

			<div>
				<label for="aadhar" class="block font-bold">Aadhar Card:</label>
				<input
					id="aadhar"
					type="file"
					required
					bind:value={employeeDetails.aadharDocument}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="pan" class="block font-bold">Pan Card:</label>
				<input
					id="pan"
					type="file"
					required
					bind:value={employeeDetails.panDocument}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="department" class="block font-bold">Department:</label>
				<input
					id="department"
					type="text"
					required
					bind:value={employeeDetails.department}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="position" class="block font-bold">Position:</label>
				<input
					id="position"
					type="text"
					required
					bind:value={employeeDetails.position}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<div>
				<label for="date-joined" class="block font-bold">Joining Date:</label>
				<input
					id="date-joined"
					type="date"
					required
					bind:value={employeeDetails.dateJoined}
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				class="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
				on:click={addNewEmployee}
			>
				Submit
			</button>
		</form>
	{/if}
</div>
