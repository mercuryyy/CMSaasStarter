<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  let adminSection: Writable<string> = getContext("adminSection");
  adminSection.set("assistants");

  let assistants = [
    { name: "Ava", id: "efe979c5-9409-4e13-a144-d446fcc4e1b5", cost: "$0.13 /min", latency: "1700 ms", provider: "groq", model: "mixtral-8x7b-32768", firstMessage: "Hello Evelin", systemPrompt: "You are Erica, and you really really need Evelin to clean your hair from lice today. Evelyn works for lice cleaning company. {name}\n\nBeg Evelin to take you in tonight for a lice cleaning treatment.\n\nGet mad is she refuses." },
    { name: "Mort", id: "mort-id", cost: "$0.13 /min", latency: "1700 ms", provider: "groq", model: "model-id", firstMessage: "Hello Mort", systemPrompt: "Prompt for Mort." },
    { name: "Mary", id: "mary-id", cost: "$0.13 /min", latency: "1700 ms", provider: "groq", model: "model-id", firstMessage: "Hello Mary", systemPrompt: "Prompt for Mary." },
    { name: "Leo", id: "leo-id", cost: "$0.13 /min", latency: "1700 ms", provider: "groq", model: "model-id", firstMessage: "Hello Leo", systemPrompt: "Prompt for Leo." },
    { name: "Medical Assistant", id: "medical-assistant-id", cost: "$0.13 /min", latency: "1700 ms", provider: "groq", model: "model-id", firstMessage: "Hello Medical Assistant", systemPrompt: "Prompt for Medical Assistant." }
  ];

  let selectedAssistant = assistants[0];
</script>

<svelte:head>
  <title>Assistants</title>
</svelte:head>

<div class="flex h-screen">
  <!-- Sidebar -->
  <div class="w-1/4 bg-base-200 p-4">
    <button class="btn btn-primary mb-4 w-full">+ Create Assistant</button>
    <nav class="space-y-2">
      {#each assistants as assistant}
        <button on:click={() => selectedAssistant = assistant} class="block py-2 px-4 rounded hover:bg-base-300 w-full text-left">
          {assistant.name}
        </button>
      {/each}
    </nav>
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{selectedAssistant.name}</h1>
      <button class="btn btn-secondary">Talk with {selectedAssistant.name}</button>
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
        <a class="tab tab-lifted tab-active" href="#model">Model</a>
        <a class="tab tab-lifted" href="#transcriber">Transcriber</a>
        <a class="tab tab-lifted" href="#voice">Voice</a>
        <a class="tab tab-lifted" href="#functions">Functions</a>
        <a class="tab tab-lifted" href="#advanced">Advanced</a>
        <a class="tab tab-lifted" href="#analysis">Analysis</a>
      </div>

      <!-- Tab Contents -->
      <div id="model" class="tab-content">
        <h2 class="text-xl font-bold mb-4">Model</h2>
        <div class="bg-base-100 p-4 rounded shadow">
          <div class="mb-4">
            <label class="block font-bold">First Message</label>
            <p>{selectedAssistant.firstMessage}</p>
          </div>
          <div class="mb-4">
            <label class="block font-bold">System Prompt</label>
            <p>{selectedAssistant.systemPrompt}</p>
          </div>
          <div class="mb-4">
            <label class="block font-bold">Provider</label>
            <p>{selectedAssistant.provider}</p>
          </div>
          <div class="mb-4">
            <label class="block font-bold">Model</label>
            <p>{selectedAssistant.model}</p>
          </div>
        </div>
        <button class="btn btn-primary mt-4">Publish</button>
      </div>

      <!-- Placeholder for other tabs -->
      <div id="transcriber" class="tab-content hidden">Transcriber Content</div>
      <div id="voice" class="tab-content hidden">Voice Content</div>
      <div id="functions" class="tab-content hidden">Functions Content</div>
      <div id="advanced" class="tab-content hidden">Advanced Content</div>
      <div id="analysis" class="tab-content hidden">Analysis Content</div>
    </div>
  </div>
</div>

<style>
  .tab-content:not(.hidden) {
    display: block;
  }

  .tab-content.hidden {
    display: none;
  }
</style>
