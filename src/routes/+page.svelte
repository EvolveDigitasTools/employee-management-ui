<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isTokenVerified } from '../utils/utils';

	// Sample employee data (to be replaced with API data)
	let employees: any[] = [];
	let filteredEmployees: any[] = [];
	let searchQuery = '';

	// Fetch employees on component mount
	onMount(async () => {
		try {
			const token = localStorage.getItem('token');

			if (!(await isTokenVerified(token ?? ''))) {
				// If there's no token, redirect to login page
				goto('/login');
			}
			const res = await fetch(import.meta.env.VITE_API_URL + '/employee/all-employees', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}); // Replace with your backend endpoint
			const data = await res.json();
			employees = data.employees;
			filteredEmployees = employees; // Initialize filtered list
		} catch (error) {
			console.error('Error fetching employees:', error);
		}
	});

	// Search and filter logic
	const handleSearch = () => {
		filteredEmployees = employees.filter((employee) =>
			employee.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	};
</script>

<div class="container mx-auto mt-4 px-4">
	<!-- Header with Search, Filter, and Button -->
	<div class="mb-4 flex items-center justify-between">
		<div class="flex space-x-2">
			<input
				type="text"
				placeholder="Search by name"
				bind:value={searchQuery}
				on:input={handleSearch}
				class="w-64 rounded-md border border-gray-300 p-2"
			/>
		</div>
		<button
			on:click={() => (window.location.href = '/employees/new')}
			class="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
		>
			New Employee
		</button>
	</div>

	<!-- Employee List -->
	<table class="w-full table-auto border-collapse border border-gray-300">
		<thead>
			<tr class="bg-gray-100">
				<th class="border p-2">Name</th>
				<th class="border p-2">Work Email ID</th>
				<th class="border p-2">Position</th>
				<th class="border p-2">Department</th>
				<th class="border p-2">Working For</th>
			</tr>
		</thead>
		<tbody>
			{#each filteredEmployees as employee}
				<tr class="hover:bg-gray-50">
					<td class="border p-2">{employee.name}</td>
					<td class="border p-2">{employee.workMailId}</td>
					<td class="border p-2">{employee.position}</td>
					<td class="border p-2">{employee.department}</td>
					<td class="border p-2">{employee.workingFor} years</td>
					<!-- <td class="border p-2">
						<button
							on:click={() => (window.location.href = `/employees/${employee.id}`)}
							class="text-blue-500 hover:underline"
						>
							View Details
						</button>
					</td> -->
				</tr>
			{/each}
		</tbody>
	</table>
</div>
