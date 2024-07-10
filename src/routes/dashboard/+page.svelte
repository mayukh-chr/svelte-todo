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
    let yes = false;
  
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
  </script>
  
  <main>
    <h1>Dashboard</h1>
    <form on:submit|preventDefault={addNote}>
      <input type="text" bind:value={note} placeholder="Enter note" />
      <button type="submit">Add Note</button>
    </form>
  
    <h2>Active Notes</h2>
    <ul>
      {#each $notes as note}
        <li>
          <input type="checkbox" bind:checked={note.archived} on:click={() => archiveNote(note.id)}/>
          {note.content} 
          <!-- <button on:click={() => archiveNote(note.id)}>Archive</button> -->
          
        </li>
      {/each}
    </ul>
  
    <h2>Archived Notes</h2>
    <ul>
      {#each $archivedNotes as note}
        <li>
          <input type="checkbox" bind:checked={note.archived} on:click={() => unarchiveNote(note.id)}/>

          {note.content}
          <button on:click={() => deleteNote(note.id)}>delete</button>
           <!-- <button on:click={() => unarchiveNote(note.id)}>Unarchive</button> -->
        </li>
      {/each}
    </ul>
  </main>

  <style>
    
    main{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
  </style>
  