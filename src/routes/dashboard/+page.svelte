<!-- src/routes/dashboard/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/firebase';
    import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
    import { onAuthStateChanged } from 'firebase/auth';
    import { writable } from 'svelte/store';
  
    const notes = writable([]); 
    const archivedNotes = writable([]);
  
    let note = '';
    let user = null;
    // let yes = false;
    let activeTab = 'active';
  
    onMount(() => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user = currentUser;
          fetchNotes();
        } else {
          goto('/');
        }
      });
    });
  
    async function fetchNotes() {
      const q = query(collection(db, 'notes'), where('userId', '==', user.uid), where('archived', '==', false));
      const qArchived = query(collection(db, 'notes'), where('userId', '==', user.uid), where('archived', '==', true));
  
      onSnapshot(q, (querySnapshot) => {
        const notesList = [];
        querySnapshot.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });
        notes.set(notesList);
      });
  
      onSnapshot(qArchived, (querySnapshot) => {
        const archivedNotesList = [];
        querySnapshot.forEach((doc) => {
          archivedNotesList.push({ id: doc.id, ...doc.data() });
        });
        archivedNotes.set(archivedNotesList);
      });
    }
  
    async function addNote() {
      if (note.trim()) {
        await addDoc(collection(db, 'notes'), {
          userId: user.uid,
          content: note,
          archived: false,
          createdAt: new Date()
        });
        note = '';
      }
    }
  
    async function archiveNote(id) {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { archived: true });
    }
  
    async function unarchiveNote(id) {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { archived: false });
    }

    async function deleteNote(id) {
      const noteRef = doc(db, 'notes', id);
      deleteDoc(noteRef, { archived: false });
    }

    function setActiveTab(tab) {
    activeTab = tab;
  }
  </script>
  
  <main>
    <header>
      <h1>Notes App</h1>
      <div class="tab-buttons">
        <button 
          class:active={activeTab === 'active'} 
          on:click={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          class:active={activeTab === 'archive'} 
          on:click={() => setActiveTab('archive')}
        >
          Archive
        </button>
      </div>
    </header>
  
    <form on:submit|preventDefault={addNote}>
      <input type="text" bind:value={note} placeholder="Enter note" />
      <button type="submit">Add Note</button>
    </form>
  
    {#if activeTab === 'active'}
      <h2>Active Notes</h2>
      <ul>
        {#each $notes as note}
          <li>
            <input type="checkbox" on:click={() => archiveNote(note.id)}/>
            {note.content}
          </li>
        {/each}
      </ul>
    {:else}
      <h2>Archived Notes</h2>
      <ul>
        {#each $archivedNotes as note}
          <li>
            <input type="checkbox" on:click={() => unarchiveNote(note.id)}/>
            {note.content}
            <button on:click={() => deleteNote(note.id)}>delete</button>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
  
  <style>
    main {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  
    h1 {
      margin: 0;
    }
  
    .tab-buttons {
      display: flex;
      gap: 10px;
    }
  
    button {
      padding: 10px 20px;
      border: none;
      background-color: #f0f0f0;
      cursor: pointer;
      border-radius: 5px;
    }
  
    button.active {
      background-color: #007bff;
      color: white;
    }
  
    form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
  
    input[type="text"] {
      flex-grow: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    ul {
      list-style-type: none;
      padding: 0;
    }
  
    li {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
  </style>