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
      <script>
        function getButtonClass(assistantId) {
          return `block py-2 px-4 rounded hover:bg-base-300 w-full text-left ${selectedAssistant && selectedAssistant.id === assistantId ? 'bg-primary text-white' : ''}`;
        }
      </script>
      
      <button on:click={() => selectAssistant(assistant.id)} class={getButtonClass(assistant.id)}>
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

        <!-- Tabs -->
        <div class="tabs">
          <a class="tab tab-lifted {selectedTab === 'model' ? 'tab-active' : ''}" on:click={() => selectedTab = 'model'}>Model</a>
          <a class="tab tab-lifted {selectedTab === 'transcriber' ? 'tab-active' : ''}" on:click={() => selectedTab = 'transcriber'}>Transcriber</a>
          <a class="tab tab-lifted {selectedTab === 'voice' ? 'tab-active' : ''}" on:click={() => selectedTab = 'voice'}>Voice</a>
          <a class="tab tab-lifted {selectedTab === 'functions' ? 'tab-active' : ''}" on:click={() => selectedTab = 'functions'}>Functions</a>
          <a class="tab tab-lifted {selectedTab === 'advanced' ? 'tab-active' : ''}" on:click={() => selectedTab = 'advanced'}>Advanced</a>
          <a class="tab tab-lifted {selectedTab === 'analysis' ? 'tab-active' : ''}" on:click={() => selectedTab = 'analysis'}>Analysis</a>
        </div>

        <!-- Tab Contents -->
        <div class="mt-4">
          {#if selectedTab === 'model'}
            <div id="model" class="tab-content">
              <h2 class="text-xl font-bold mb-4">Model</h2>
              <div class="bg-base-100 p-4 rounded shadow">
                <div class="mb-4">
                  <label class="block font-bold">First Message</label>
                  <input class="w-full p-2 border rounded" bind:value={selectedAssistant.first_message} />
                </div>
                <div class="mb-4">
                  <label class="block font-bold">System Prompt</label>
                  <textarea class="w-full p-2 border rounded" bind:value={selectedAssistant.system_prompt}></textarea>
                </div>
                <div class="mb-4">
                  <label class="block font-bold">Provider</label>
                  <select class="w-full p-2 border rounded" bind:value={selectedAssistant.model} on:change={() => updateModelOptions(selectedAssistant.model)}>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Groq">Groq</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="block font-bold">Model</label>
                  <select class="w-full p-2 border rounded" bind:value={selectedAssistant.model_name}>
                    {#each modelOptions as option}
                      <option value={option}>{option}</option>
                    {/each}
                  </select>
                </div>
              </div>
              <button class="btn btn-primary mt-4" on:click={publishAssistant}>Publish</button>
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

  .bg-primary {
    background-color: var(--primary);
  }

  .text-white {
    color: white;
  }
</style>
