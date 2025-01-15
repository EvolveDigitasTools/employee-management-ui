<script lang="ts">
    export let department: string = "", designation: string = "", dateJoined: string = "", updateField: (field: string, value: string) => void;
  
    const handleDateChange = (e: Event) => {
      updateField('dateJoined', (e.target as HTMLInputElement).value);
    };
  </script>
  
  <div class="space-y-6">
    <!-- Department -->
    <div class="space-y-2">
      <label for="department" class="block text-sm font-medium text-gray-700">
        Department
      </label>
      <input
        type="text"
        id="department"
        class="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        placeholder="Enter department"
        value={department}
        on:change={(e: Event) => updateField("department", (e.target as HTMLInputElement).value)}
      />
    </div>
  
    <!-- Position -->
    <div class="space-y-2">
      <label for="designation" class="block text-sm font-medium text-gray-700">
        Designation
      </label>
      <input
        type="text"
        id="designation"
        class="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        placeholder="Enter designation you're joining in"
        value={designation}
        on:change={(e: Event) => updateField("designation", (e.target as HTMLInputElement).value)}
      />
    </div>
  
    <!-- Joining Date -->
    <div class="space-y-2">
      <label for="date-joined" class="block text-sm font-medium text-gray-700">
        Joining Date
      </label>
      <input
        type="date"
        id="date-joined"
        class="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={dateJoined}
        on:change={handleDateChange}
      />
    </div>
  </div>
  