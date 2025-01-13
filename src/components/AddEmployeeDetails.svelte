<script lang="ts">
    export let updateEmployeeDetail: (key: string, value: any) => void, name: string, email: string, phone: string;
    let profileImgURL: string | null = null, fileInput: HTMLInputElement | null = null;

    const updateExperienceDocument = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
            updateEmployeeDetail('profileImg', file);
			const reader = new FileReader();
			reader.onload = () => {
				profileImgURL = reader.result as string; 
			};
			reader.readAsDataURL(file); 
		}
	};
</script>
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
                value={name}
                on:change={(e: Event) => updateEmployeeDetail('name', (e.target as HTMLInputElement).value)}
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
                value={email}
                on:change={(e: Event) => updateEmployeeDetail('email', (e.target as HTMLInputElement).value)}
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
                value={phone}
                on:change={(e: Event) => updateEmployeeDetail('phone', (e.target as HTMLInputElement).value)}
            />
        </div>
    </div>
</div>
