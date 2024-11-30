<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<!-- Add this line to enable prerendering for this layout -->
<script context="module" lang="ts">
  export const prerender = true;
</script>
