<script lang="ts">
    export let documents = {
      aadharDocument: null as File | null,
      panDocument: null as File | null,
    }, updateDocument: (field: "aadharDocument" | "panDocument", value: File | null) => void;
    let error = "";
  
    const handleFileUpload = (e: Event, type: "aadharDocument" | "panDocument") => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
          error = "Only PDF, JPG, or PNG files are allowed.";
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          error = "File size cannot exceed 2MB.";
          return;
        }
        updateDocument(type, file);
        error= "";
      }
    };
  
    const removeFile = (type: "aadharDocument" | "panDocument") => {
      updateDocument(type, null);
      error = "";
    };
  </script>
  
  <div class="space-y-6">
    <!-- Aadhaar Upload -->
    <div class="space-y-2">
      <label for="aadhar-card" class="block text-sm font-medium text-gray-700">Upload Aadhaar Card</label>
      <div id = "aadhar-card"
        class="flex items-center gap-4 rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm"
      >
        {#if documents.aadharDocument}
          <div class="flex flex-1 items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 16c0 1.105.672 2 1.5 2h7c.828 0 1.5-.895 1.5-2m-9 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-2m-7 0a2 2 0 01-2 2m4-2V8"
              />
            </svg>
            <div class="flex-1">
              <p class="truncate text-sm font-medium text-gray-700">{documents.aadharDocument.name}</p>
              <p class="text-xs text-gray-500">{(documents.aadharDocument.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            class="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            on:click={() => removeFile("aadharDocument")}
          >
            Remove
          </button>
        {:else}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            id="aadhar-upload"
            class="hidden"
            on:change={(e) => handleFileUpload(e, "aadharDocument")}
          />
          <label
            for="aadhar-upload"
            class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Upload Aadhaar
          </label>
        {/if}
      </div>
    </div>
  
    <!-- PAN Card Upload -->
    <div class="space-y-2">
      <label for="pan-card" class="block text-sm font-medium text-gray-700">Upload PAN Card</label>
      <div id="pan-card"
        class="flex items-center gap-4 rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm"
      >
        {#if documents.panDocument}
          <div class="flex flex-1 items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 16c0 1.105.672 2 1.5 2h7c.828 0 1.5-.895 1.5-2m-9 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-2m-7 0a2 2 0 01-2 2m4-2V8"
              />
            </svg>
            <div class="flex-1">
              <p class="truncate text-sm font-medium text-gray-700">{documents.panDocument.name}</p>
              <p class="text-xs text-gray-500">{(documents.panDocument.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            class="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            on:click={() => removeFile("panDocument")}
          >
            Remove
          </button>
        {:else}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            id="pan-upload"
            class="hidden"
            on:change={(e) => handleFileUpload(e, "panDocument")}
          />
          <label
            for="pan-upload"
            class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Upload PAN Card
          </label>
        {/if}
      </div>
    </div>

    {#if error}
      <p class="text-sm text-red-500">{error}</p>
    {/if}
  </div>
  