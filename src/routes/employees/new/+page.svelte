<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isTokenVerified, onboardingLevels } from '../../../utils/utils';
	import type {
		EmployeeDetails,
		EmployeeDetailsExtracted,
		WorkExperience
	} from '../../../utils/interfaces';
	import { Home, Icon } from 'svelte-hero-icons';
	import UploadResume from '../../../components/UploadResume.svelte';

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

	const updateProgress = (employeeDetails: EmployeeDetails) => {
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
		} else if (activeLevel == 2) {
			submitEnabled = true;
			employeeDetails.workExperiences.forEach((experience) => {
				if (
					!(experience.company && experience.company.length > 0) ||
					!(experience.position && experience.position.length > 0) ||
					!(experience.startDate && experience.startDate.length > 0) ||
					!(experience.endDate && experience.endDate.length > 0) ||
					!experience.experienceDocument
				) {
					submitEnabled = false;
				}
			});
		} else {
			submitEnabled = false;
		}
	};

	const updateEmployeeDetails = (updatedEmployeeDetails: EmployeeDetails) => {
		employeeDetails = updatedEmployeeDetails;
		updateProgress(employeeDetails);
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
				case 2:
					result = true;
				default:
					break;
			}

			if (result) {
				onboardingLevelsStatus[activeLevel] = true;
				activeLevel++;
				updateProgress(employeeDetails);
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

	const addNewExperience = () => {
		let newExperience: WorkExperience = {
			company: '',
			position: '',
			startDate: '',
			endDate: '',
			experienceDocument: null
		};
		employeeDetails = {
			...employeeDetails,
			workExperiences: [...employeeDetails.workExperiences, newExperience]
		};
	};

	const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
		employeeDetails = {
			...employeeDetails,
			workExperiences: employeeDetails.workExperiences.map((experience, i) => {
				if (i === index) {
					return {
						...experience,
						[field]: value
					};
				}
				return experience;
			})
		};
	};

	const deleteExperience = (index: number) => {
		employeeDetails = {
			...employeeDetails,
			workExperiences: employeeDetails.workExperiences.filter((_, i) => i !== index)
		};
	};

	const updateExperienceDocument = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			employeeDetails.profileImg = file;
			updateProgress(employeeDetails);
			const reader = new FileReader();
			reader.onload = () => {
				profileImgURL = reader.result as string; // Store the data URL
			};
			reader.readAsDataURL(file); // Convert file to data URL
		}
	};

	$: updateProgress(employeeDetails);
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
	<div class="col-span-2 h-full overflow-hidden rounded-xl border-2 border-solid bg-white py-8">
		<div class="custom-scrollbar h-[90%] overflow-y-scroll px-8">
			{#if activeLevel == 0}
				<UploadResume uploadResume={(file: File) =>
					updateEmployeeDetails({
						...employeeDetails,
						resumeDocument: file
					})} resumeDocument={employeeDetails.resumeDocument} />
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
								on:change={updateExperienceDocument}
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
								on:change={() => updateProgress(employeeDetails)}
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
								on:change={() => updateProgress(employeeDetails)}
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
								on:change={() => updateProgress(employeeDetails)}
							/>
						</div>
					</div>
				</div>
			{/if}
			{#if activeLevel == 2}
				<ul role="list" class="divide-y">
					{#each employeeDetails.workExperiences as experience, index}
						<div
							class="my-3 rounded-lg border-2 border-solid border-gray-400 bg-white p-4 shadow-md"
						>
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
										<label for="end-date" class="block text-sm font-medium text-gray-700"
											>End Date</label
										>
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
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add New Experience
				</button>
			{/if}
		</div>
		<div class="flex h-[10%] items-end justify-end gap-x-6 border-t px-8">
			<button
				type="submit"
				disabled={submitEnabled ? false : true}
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-500"
				on:click={submitSteps}>Submit{submitEnabled ? '' : ' (enter all details)'}</button
			>
		</div>
	</div>
	{#if false}
		<form on:submit|preventDefault={submitForm} class="space-y-4">

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
		</form>
	{/if}
</div>
