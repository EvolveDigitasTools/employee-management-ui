<script lang="ts">
	import { goto } from "$app/navigation";

    let username: string = "";
    let password: string = "";
    let errorMessage: string = "";
  
    // Handle the login submission
    const handleLogin = async () => {
      try {
        let apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
  
          // Redirect to the home page (dashboard)
          goto("/");
        } else {
          const errorData = await response.json();
          errorMessage = errorData.message || "Login failed. Please try again.";
        }
      } catch (error) {
        console.error("Error logging in:", error);
        errorMessage = "An error occurred. Please try again later.";
      }
    };
  </script>
  
  <!-- Login Form -->
  <div class="login max-w-md mx-auto mt-10 p-4 border-2 border-gray-300 rounded-md shadow-md">
    <h2 class="text-center text-2xl font-bold mb-4">Login</h2>
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          class="mt-2 p-2 border rounded w-full"
          placeholder="Enter your username"
          required
        />
      </div>
  
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          class="mt-2 p-2 border rounded w-full"
          placeholder="Enter your password"
          required
        />
      </div>
  
      {#if errorMessage}
        <div class="text-red-500 text-sm">{errorMessage}</div>
      {/if}
  
      <div class="text-center">
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </form>
  </div>
  