<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, provider } from '$lib/firebase';
    import { signInWithPopup, getAuth } from 'firebase/auth';
  
    onMount(() => {
      const user = getAuth().currentUser;
      if (user) {
        goto('/dashboard');
      }
    });
  
    async function login() {
      try {
        await signInWithPopup(auth, provider);
        goto('/dashboard');
      } catch (error) {
        console.error('Error logging in: ', error);
      }
    }
  </script>
  
  <main>
    <h1>Welcome to the Todo App</h1>
    <button on:click={login}>Login with Google</button>
  </main>
  