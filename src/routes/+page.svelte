<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, provider } from '$lib/firebase';
  import { signInWithPopup, getAuth } from 'firebase/auth';

  let canvas;
  let ctx;
  let dots = [];
  let mouseX = 0;
  let mouseY = 0;

  onMount(() => {
      const user = getAuth().currentUser;
      if (user) {
          goto('/dashboard');
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');

      // Create dots
      const spacing = 20;
      for (let x = 0; x < canvas.width; x += spacing) {
          for (let y = 0; y < canvas.height; y += spacing) {
              dots.push({ x, y, baseRadius: 1, radius: 1 });
          }
      }

      animate();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', handleResize);
      };
  });

  async function login() {
      try {
          await signInWithPopup(auth, provider);
          goto('/dashboard');
      } catch (error) {
          console.error('Error logging in: ', error);
      }
  }

  function handleMouseMove(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
  }

  function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }

  function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 50;

          if (distance < maxDistance) {
              dot.radius = dot.baseRadius * (1 - distance / maxDistance);
          } else {
              dot.radius = dot.baseRadius;
          }

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'black';
          ctx.fill();
      });

      requestAnimationFrame(animate);
  }
</script>

<main>
  <canvas bind:this={canvas}></canvas>
  <div class="content">
      <h1>Todo Login</h1>
      <button on:click={login}>Login with Google</button>
  </div>
</main>

<style>
  main {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
  }

  canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
  }

  .content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: Arial, sans-serif;
  }

  h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
      text-align: center;
  }

  button {
      padding: 12px 24px;
      font-size: 1rem;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
      color: white;
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
  }

  button:hover {
      transform: scale(1.05);
  }

  button:active {
      transform: scale(0.95);
  }
</style>