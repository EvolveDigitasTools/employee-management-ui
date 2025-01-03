<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
</script>

<nav class="bg-gray-800 p-4 text-white border-b-2 border-white h-[12%]">
	<div class="container mx-auto flex items-center justify-between">
		<!-- Left: Company Logo -->
		<div class="flex items-center space-x-1 w-32">
			<img src="/plugin-logo.png" alt="Company Logo" class="h-14" />
			<!-- Replace with your logo file -->
			<!-- <span class="text-lg font-bold">Pluugin ECommerce</span> -->
		</div>

		<!-- Center: Navbar Title -->
		<div class="text-xl font-semibold">HR Management Portal</div>

		<!-- Right: Empty -->
		<div class="w-32"></div>
	</div>
</nav>

<main class="container mx-auto h-[88%]">
	<slot />
</main>
