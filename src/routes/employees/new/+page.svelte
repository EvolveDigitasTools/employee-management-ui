<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isTokenVerified, onboardingLevels } from '../../../utils/utils';
	import type { EmployeeDetails, EmployeeDetailsExtracted } from '../../../utils/interfaces';
	import { Home, Icon } from 'svelte-hero-icons';
	import UploadResume from '../../../components/UploadResume.svelte';
	import AddEmployeeDetails from '../../../components/AddEmployeeDetails.svelte';
	import AddWorkExperience from '../../../components/AddWorkExperience.svelte';
	import AddEducation from '../../../components/AddEducation.svelte';
	import AddSkillsAchievements from '../../../components/AddSkillsAchievements.svelte';
	import IdentityDocuments from '../../../components/IdentityDocuments.svelte';
	import JoiningDetails from '../../../components/JoiningDetails.svelte';

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
	let submitEnabled: boolean = false;
	let onboardingLevelsStatus = onboardingLevels.map(() => false);
	let activeLevel = 0;

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
		} else if (activeLevel == 3) {
			submitEnabled = true;
			employeeDetails.education.forEach((education) => {
				if (
					!(education.level && education.level.length > 0) ||
					!(education.institution && education.institution.length > 0) ||
					!(education.startYear && education.startYear > 1990) ||
					!(education.grade && education.grade.length > 0) ||
					!education.educationDocument
				) {
					submitEnabled = false;
				}
			});
		} else if (activeLevel == 4) submitEnabled = true;
		else if (activeLevel == 5) {
			if (employeeDetails.aadharDocument && employeeDetails.panDocument) {
				submitEnabled = true;
			} else submitEnabled = false;
		} else if (activeLevel == 6) {
			if (
				employeeDetails.department &&
				employeeDetails.department.length > 0 &&
				employeeDetails.position &&
				employeeDetails.position.length > 0 &&
				employeeDetails.dateJoined
			) {
				submitEnabled = true;
			} else {
				submitEnabled = false;
			}
		} else {
			submitEnabled = false;
		}
	};

	const updateEmployeeDetails = (updatedEmployeeDetails: EmployeeDetails) => {
		employeeDetails = updatedEmployeeDetails;
		updateProgress(employeeDetails);
	};

	const updateEmployeeDetail = (key: string, value: any) => {
		employeeDetails = {
			...employeeDetails,
			[key]: value
		};
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
							grade: education.grade ?? '',
							educationDocument: null
						};
					}) || []
			};
			return true;
		} catch (err) {
			error = 'Failed to parse the resume. Please fill the details manually.';
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
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
					result = true;
					break;
				default:
					break;
			}

			if (result) {
				onboardingLevelsStatus[activeLevel] = true;
				if(activeLevel == 6) {
					submitForm();
					return;
				}
				activeLevel++;
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
				<UploadResume
					uploadResume={(file: File) =>
						updateEmployeeDetails({
							...employeeDetails,
							resumeDocument: file
						})}
					resumeDocument={employeeDetails.resumeDocument}
				/>
			{/if}
			{#if activeLevel == 1}
				<AddEmployeeDetails
					{updateEmployeeDetail}
					name={employeeDetails.name}
					email={employeeDetails.email}
					phone={employeeDetails.phone}
				/>
			{/if}
			{#if activeLevel == 2}
				<AddWorkExperience
					workExperiences={employeeDetails.workExperiences}
					updateWorkExperiences={(updatedWorkExperiences) =>
						updateEmployeeDetails({ ...employeeDetails, workExperiences: updatedWorkExperiences })}
				/>
			{/if}
			{#if activeLevel == 3}
				<AddEducation
					educationDetails={employeeDetails.education}
					updateEducationDetails={(updatedEducationDetails) =>
						updateEmployeeDetails({ ...employeeDetails, education: updatedEducationDetails })}
				/>
			{/if}
			{#if activeLevel == 4}
				<AddSkillsAchievements
					skills={employeeDetails.skills}
					achievements={employeeDetails.achievements}
					updateSkills={(updatedSkills) => updateEmployeeDetail('skills', updatedSkills)}
					updateAchievements={(updatedAchievements) =>
						updateEmployeeDetail('achievements', updatedAchievements)}
				/>
			{/if}
			{#if activeLevel == 5}
				<IdentityDocuments
					documents={{
						aadharDocument: employeeDetails.aadharDocument,
						panDocument: employeeDetails.panDocument
					}}
					updateDocument={updateEmployeeDetail}
				/>
			{/if}
			{#if activeLevel == 6}
				<JoiningDetails
					department={employeeDetails.department}
					position={employeeDetails.position}
					dateJoined={employeeDetails.dateJoined}
					updateField={updateEmployeeDetail}
				/>
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
</div>
