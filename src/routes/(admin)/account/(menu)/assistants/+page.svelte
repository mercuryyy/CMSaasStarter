<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  let adminSection: Writable<string> = getContext("adminSection");
  adminSection.set("assistants");

  let assistants = [];
  let selectedAssistant = null;
  let selectedTab = 'model';
  let modelOptions = [];

  export let data;
  let { supabase } = data;

  onMount(async () => {
    if (!data.profile || !data.profile.id) {
      console.error('User profile ID is not available');
      return;
    }

    await loadAssistantNames();
  });

  async function loadAssistantNames() {
    const { data: assistantsData, error } = await supabase.from('assistants').select('id, assistant_name').eq('user_id', data.profile.id);
    if (error) {
      console.error('Error fetching assistants:', error);
    } else {
      assistants = assistantsData || [];
      if (assistants.length > 0) {
        await selectAssistant(assistants[0].id);
      }
    }
  }

  async function loadAssistantDetails(assistantId) {
    if (!assistantId) {
      console.error('Invalid assistant ID:', assistantId);
      return;
    }
    const { data: assistantData, error } = await supabase.from('assistants').select('*').eq('id', assistantId).single();
    if (error) {
      console.error('Error fetching assistant details:', error);
    } else {
      selectedAssistant = { ...assistantData };
      selectedTab = 'model';
      updateModelOptions(selectedAssistant.model);
    }
  }

  async function selectAssistant(assistantId) {
    await loadAssistantDetails(assistantId);
  }

  function updateModelOptions(provider) {
    switch(provider) {
      case 'OpenAI':
        modelOptions = ["gpt-4o", "gpt-3.5"];
        break;
      case 'Groq':
        modelOptions = ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"];
        break;
      case 'Local':
        modelOptions = ["unsloth/llama-3-8b-Instruct"];
        break;
      default:
        modelOptions = [];
    }
    if (selectedAssistant) {
      selectedAssistant.model_name = modelOptions[0];
    }
  }

  async function publishAssistant() {
    if (!data.profile || !data.profile.id) {
      console.error('User profile ID is not available');
      return;
    }

    if (!selectedAssistant) {
      console.error('Selected assistant is not properly initialized');
      return;
    }

    if (!selectedAssistant.model) {
      console.error('Selected assistant model is not properly initialized');
      return;
    }

    let currentAssistantId = selectedAssistant.id;

    if (!currentAssistantId) {
      // New assistant creation
      const newAssistant = {
        assistant_name: selectedAssistant.assistant_name,
        system_prompt: selectedAssistant.system_prompt,
        first_message: selectedAssistant.first_message,
        model: selectedAssistant.model,
        stt: selectedAssistant.stt,
        tts: selectedAssistant.tts,
        name: selectedAssistant.name,
        type: selectedAssistant.type,
        model_name: selectedAssistant.model_name,
        app_number: selectedAssistant.app_number,
        user_id: data.profile.id
      };

      const { data: createdAssistant, error } = await supabase.from('assistants').insert([newAssistant]).select('id').single();
      if (error) {
        console.error('Error creating assistant:', error);
      } else {
        console.log('Assistant created successfully:', createdAssistant);
        currentAssistantId = createdAssistant.id;
        assistants.push({ id: createdAssistant.id, assistant_name: selectedAssistant.assistant_name });
        await loadAssistantNames();
        await selectAssistant(currentAssistantId);
      }
    } else {
      // Existing assistant update
      console.log('Updating assistant with the following data:', selectedAssistant);

      const { error } = await supabase
        .from('assistants')
        .update({
          assistant_name: selectedAssistant.assistant_name,
          system_prompt: selectedAssistant.system_prompt,
          first_message: selectedAssistant.first_message,
          model: selectedAssistant.model,
          stt: selectedAssistant.stt,
          tts: selectedAssistant.tts,
          name: selectedAssistant.name,
          type: selectedAssistant.type,
          model_name: selectedAssistant.model_name,
          app_number: selectedAssistant.app_number
        })
        .eq('id', currentAssistantId);

      if (error) {
        console.error('Error updating assistant:', error);
      } else {
        await loadAssistantNames();
        await selectAssistant(currentAssistantId);
      }
    }
  }

  function createAssistant() {
    selectedAssistant = {
      assistant_name: '',
      system_prompt: '',
      first_message: '',
      model: 'OpenAI',
      stt: '',
      tts: '',
      name: '',
      type: '',
      model_name: 'gpt-4o',
      app_number: '',
      user_id: data.profile.id
    };
    selectedTab = 'model';
    updateModelOptions(selectedAssistant.model);
  }
</script>

<svelte:head>
  <title>Assistants</title>
</svelte:head>

<div class="flex h-screen">
  <!-- Sidebar -->
  <div class="w-1/4 bg-base-200 p-4">
    <button class="btn btn-primary mb-4 w-full" on:click={createAssistant}>+ Create Assistant</button>
    <nav class="space-y-2">
      {#each assistants as assistant (assistant.id)}
        <button on:click={() => selectAssistant(assistant.id)} class="block py-2 px-4 rounded hover:bg-base-300 w-full text-left {selectedAssistant && selectedAssistant.id === assistant.id ? 'bg-primary text-white' : ''}">
          {assistant.assistant_name}
        </button>
      {/each}
    </nav>
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-6">
    {#if selectedAssistant}
      <div class="flex justify-between items-center mb-6">
        <input class="text-2xl font-bold" bind:value={selectedAssistant.assistant_name} />
        <button class="btn btn-secondary">Talk with {selectedAssistant.assistant_name}</button>
      </div>

      <!-- Assistant Details -->
      <div class="mb-6">
        <div class="flex space-x-4 mb-4">
          <div class="bg-base-100 p-4 rounded shadow">
            <h2 class="text-lg font-bold">Cost</h2>
            <p>{selectedAssistant.cost}</p>
          </div>
          <div class="bg-base-100 p-4 rounded shadow">
            <h2 class="text-lg font-bold">Latency</h2>
            <p>{selectedAssistant.latency}</p>
          </div>
        </div>



<br><br><br>
        <!-- Tabs -->
        <div class="tabs flex space-x-4 border-b border-gray-600 p-2.5 bg-base-200 rounded-lg">
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'model' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'model'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2-2m0 0l2-2m-2 2l2 2m-2-2v6" />
            </svg>
            Model
          </a>
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'transcriber' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'transcriber'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Transcriber
          </a>
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'voice' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'voice'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6a3 3 0 013-3h0a3 3 0 013 3v13a3 3 0 11-6 0z" />
            </svg>
            Voice
          </a>
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'functions' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'functions'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            Functions
          </a>
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'advanced' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'advanced'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Advanced
          </a>
          <a class="tab px-4 py-2 rounded-t-md border border-gray-600 {selectedTab === 'analysis' ? 'bg-primary text-white' : 'text-gray-600'}" on:click={() => selectedTab = 'analysis'}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 12a4 4 0 114-4h1m2 0a4 4 0 11-4 4m0 4v6m0 0H8m4 0h4" />
            </svg>
            Analysis
          </a>
        </div>




        <!-- Tab Contents -->
        <div class="mt-4">

          
          {#if selectedTab === 'model'}
            <div id="model" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Model</h2>
              <div class="bg-base-100 p-4 rounded shadow-md">
                <div class="mb-6">
                  <label class="block font-bold mb-2">First Message</label>
                  <input class="w-full p-2 border rounded" bind:value={selectedAssistant.first_message} />
                </div>
                <div class="mb-6">
                  <label class="block font-bold mb-2">System Prompt</label>
                  <textarea class="w-full p-2 border rounded h-64" bind:value={selectedAssistant.system_prompt}></textarea>
                </div>
                <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold mb-2">Provider</label>
                    <select class="w-full p-2 border rounded" bind:value={selectedAssistant.model} on:change={() => updateModelOptions(selectedAssistant.model)}>
                      <option value="OpenAI">OpenAI</option>
                      <option value="Groq">Groq</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-2">Model</label>
                    <select class="w-full p-2 border rounded" bind:value={selectedAssistant.model_name}>
                      {#each modelOptions as option}
                        <option value={option}>{option}</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center text-center">
                  <div>
                    <label class="block font-bold mb-2">Temperature <span class="text-gray-700">{selectedAssistant.temperature || 0.7}</span></label>
                    <input type="range" min="0" max="1" step="0.1" bind:value={selectedAssistant.temperature} class="slider w-full" />
                  </div>
                  <div>
                    <label class="block font-bold mb-2">Max Tokens</label>
                    <input type="number" min="1" max="5000" bind:value={selectedAssistant.max_tokens} class="w-full p-2 border rounded" />
                  </div>
                  <div class="flex items-center justify-center mt-0">
                    <input type="checkbox" bind:checked={selectedAssistant.detect_emotion} class="form-checkbox h-5 w-5 text-gray-600 mr-2" />
                    <label class="font-bold">Detect Emotion</label>
                  </div>
                </div>
              </div>
            </div>
          {/if}


          {#if selectedTab === 'transcriber'}
            <div id="transcriber" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Transcriber</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <p>Transcriber content for {selectedAssistant.assistant_name}</p>
              </div>
            </div>
          {/if}

          {#if selectedTab === 'voice'}
            <div id="voice" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Voice</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <p>Voice content for {selectedAssistant.assistant_name}</p>
              </div>
            </div>
          {/if}

          {#if selectedTab === 'functions'}
            <div id="functions" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Functions</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <p>Functions content for {selectedAssistant.assistant_name}</p>
              </div>
            </div>
          {/if}

          {#if selectedTab === 'advanced'}
            <div id="advanced" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Advanced</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <p>Advanced content for {selectedAssistant.assistant_name}</p>
              </div>
            </div>
          {/if}

          {#if selectedTab === 'analysis'}
            <div id="analysis" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Analysis</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <p>Analysis content for {selectedAssistant.assistant_name}</p>
              </div>
            </div>
          {/if}
        </div>
                <button class="btn btn-primary mt-4" on:click={publishAssistant}>Publish</button>
      </div>
    {:else}
      <p>Loading assistants...</p>
    {/if}
  </div>
</div>
<style>
  .tab-content:not(.hidden) {
    display: block;
  }

  .tab-content.hidden {
    display: none;
  }

  .tab.tab-active {
    border-bottom: 2px solid currentColor;
  }
</style>

