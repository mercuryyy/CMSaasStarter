<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("assistants")
</script>

<svelte:head>
  <title>Assistants</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">Assistants</h1>

<div class="my-6">
  <div class="flex justify-between items-center">
    <h2 class="text-xl font-bold mb-1">Create Assistant</h2>
    <button class="btn btn-primary">+ Create Assistant</button>
  </div>
  <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Ava</h3>
        <p>Cost: ~$0.13 /min</p>
        <p>Latency: ~1700 ms</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm">Edit</button>
          <button class="btn btn-secondary btn-sm">Delete</button>
        </div>
      </div>
    </div>
    <!-- Repeat this block for each assistant -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Mort</h3>
        <p>Cost: ~$0.13 /min</p>
        <p>Latency: ~1700 ms</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm">Edit</button>
          <button class="btn btn-secondary btn-sm">Delete</button>
        </div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Mary</h3>
        <p>Cost: ~$0.13 /min</p>
        <p>Latency: ~1700 ms</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm">Edit</button>
          <button class="btn btn-secondary btn-sm">Delete</button>
        </div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Leo</h3>
        <p>Cost: ~$0.13 /min</p>
        <p>Latency: ~1700 ms</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm">Edit</button>
          <button class="btn btn-secondary btn-sm">Delete</button>
        </div>
      </div>
    </div>
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Medical Assistant</h3>
        <p>Cost: ~$0.13 /min</p>
        <p>Latency: ~1700 ms</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm">Edit</button>
          <button class="btn btn-secondary btn-sm">Delete</button>
        </div>
      </div>
    </div>
  </div>
</div>
