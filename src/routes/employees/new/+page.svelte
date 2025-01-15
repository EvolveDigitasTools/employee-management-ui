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
		designation: '',
		dateJoined: '',
		aadhaarCard: null,
		panCard: null,
		resume: null,
		profileImg: null
	};
	let error = '';
	let submitEnabled: boolean = false;
	let submitLoading: boolean = false;
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

	const updateProgress = (employeeDetails: EmployeeDetails, activeLevel: number) => {
		if (activeLevel == 0) {
			submitEnabled = !!employeeDetails.resume;
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
					!(experience.companyName && experience.companyName.length > 0) ||
					!(experience.designation && experience.designation.length > 0) ||
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
			if (employeeDetails.aadhaarCard && employeeDetails.panCard) {
				submitEnabled = true;
			} else submitEnabled = false;
		} else if (activeLevel == 6) {
			if (
				employeeDetails.department &&
				employeeDetails.department.length > 0 &&
				employeeDetails.designation &&
				employeeDetails.designation.length > 0 &&
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
	};

	const updateEmployeeDetail = (key: string, value: any) => {
		employeeDetails = {
			...employeeDetails,
			[key]: value
		};
	};

	// Resume submission and parsing
	const submitResume: () => Promise<boolean> = async () => {
		if (!employeeDetails.resume) {
			error = 'Please upload a resume.';
			return false;
		}
		submitLoading = true;

		error = '';
		const formData = new FormData();
		formData.append('file', employeeDetails.resume);

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
							companyName: experience.companyName ?? '',
							designation: experience.designation ?? '',
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
			submitLoading = false;
			return true;
		} catch (err) {
			error = 'Failed to parse the resume. Please fill the details manually.';
			console.error(err);
			submitLoading = false;
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
				if (activeLevel == 6) {
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

	const transformWorkExperienceDates = (workExperience: WorkExperience) => {
		const [startYear, startMonth] = workExperience.startDate.split('-');
		const [endYear, endMonth] = workExperience.endDate.split('-');

		return {
			companyName: workExperience.companyName,
			designation: workExperience.designation,
			experienceDocument: workExperience.experienceDocument,
			startYear,
			startMonth,
			endYear,
			endMonth
		};
	};

	// Submit the complete form
	const submitForm = async () => {
		try {
			submitLoading = true;
			const employeeDetailsFormData = new FormData();
			Object.entries(employeeDetails).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					// Handle arrays (skills, achievements, workExperiences, education)
					if (key === 'workExperiences') {
						value.forEach((work, index) => {
							const transformedWork = transformWorkExperienceDates(work);
							Object.entries(transformedWork).forEach(([workKey, workValue]) => {
								employeeDetailsFormData.append(
									`workExperiences[${index}].${workKey}`,
									workValue as string | Blob
								);
							});
						});
					} else if (key === 'education') {
						value.forEach((edu, index) => {
							Object.entries(edu).forEach(([eduKey, eduValue]) => {
								employeeDetailsFormData.append(
									`education[${index}].${eduKey}`,
									eduValue as string | Blob
								);
							});
						});
					} else {
						value.forEach((item) => employeeDetailsFormData.append(`${key}[]`, item));
					}
				} else {
					// Handle simple fields
					employeeDetailsFormData.append(key, value);
				}
			});
			const res = await fetch(import.meta.env.VITE_API_URL + '/employee/new', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				body: employeeDetailsFormData
			});
			if (res.ok) {
				submitLoading = false
				goto('/'); // Redirect to the homepage on success
			} else {
				error = 'Failed to submit the details. Please try again.';
				submitLoading = false;
			}
		} catch (err) {
			error = 'An error occurred while submitting the form, please try again after some time or contact admin';
			console.error(err);
			submitLoading = false;
		}
	};

	$: updateProgress(employeeDetails, activeLevel);
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
							resume: file
						})}
					resumeDocument={employeeDetails.resume}
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
						aadharDocument: employeeDetails.aadhaarCard,
						panDocument: employeeDetails.panCard
					}}
					updateDocument={updateEmployeeDetail}
				/>
			{/if}
			{#if activeLevel == 6}
				<JoiningDetails
					department={employeeDetails.department}
					designation={employeeDetails.designation}
					dateJoined={employeeDetails.dateJoined}
					updateField={updateEmployeeDetail}
				/>
			{/if}
		</div>
		<div class="flex h-[10%] items-end justify-end gap-x-6 border-t px-8">
			<button
				type="submit"
				disabled={!submitEnabled || submitLoading}
				class="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-500"
				on:click={submitSteps}
			>
				{#if submitLoading	}
					<svg
						class="mr-2 h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Please wait...
				{:else}
					Submit{submitEnabled ? '' : ' (enter all details)'}
				{/if}
			</button>
		</div>
	</div>
</div>
