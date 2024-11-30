<script lang="ts">
  import { onMount } from 'svelte';

  // Declare variables to hold the file input and response data
  let file: File | null = null;
  let parsedData: { name?: string; email?: string; phone?: string } = {};
  let isLoading = false;
  let errorMessage = '';

  // Handle file upload
  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files?.[0]) {
      file = target.files[0];
      console.log("File selected:", file);
    }
  };

  // Handle form submission (sending the file to backend)
  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!file) {
      errorMessage = 'Please select a file.';
      return;
    }

    isLoading = true;
    errorMessage = '';  // Reset error message

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the backend API for parsing
      const response = await fetch('http://employee-management-api.globalplugin.com/api/parsing/upload-resume', {
        method: 'POST',
        body: formData,
      });

      // If the response is successful, parse the data
      if (response.ok) {
        const data = await response.json();
        parsedData = data; // Assuming the response contains name, email, and phone
      } else {
        errorMessage = 'Failed to parse resume. Please try again.';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      errorMessage = 'An error occurred while uploading the file.';
    } finally {
      isLoading = false;
    }
  };
</script>

<!-- File Upload Form -->
<div class="max-w-lg mx-auto mt-10 p-4 border-2 border-gray-300 rounded-md shadow-md">
  <h2 class="text-center text-2xl font-bold mb-4">Upload Your Resume</h2>
  <form on:submit={handleSubmit} class="space-y-4">
    <div>
      <label for="resume" class="block text-sm font-medium text-gray-700">Choose a file</label>
      <input
        id="resume"
        type="file"
        accept=".pdf,.docx"
        on:change={handleFileUpload}
        class="mt-2 p-2 border rounded w-full"
      />
    </div>

    <div class="text-center">
      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  </form>

  {#if isLoading}
    <div class="text-center mt-4 text-gray-600">Parsing resume...</div>
  {/if}

  {#if errorMessage}
    <div class="text-center mt-4 text-red-600">{errorMessage}</div>
  {/if}

  {#if parsedData.name || parsedData.email || parsedData.phone}
    <div class="mt-6 p-4 border-t-2 border-gray-300">
      <h3 class="text-xl font-semibold">Parsed Data</h3>
      <p><strong>Name:</strong> {parsedData.name}</p>
      <p><strong>Email:</strong> {parsedData.email}</p>
      <p><strong>Phone:</strong> {parsedData.phone}</p>
    </div>
  {/if}
</div>

<script context="module" lang="ts">
  export const prerender = true;
</script>