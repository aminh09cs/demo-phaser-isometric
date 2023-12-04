<script setup lang="ts">
import PhaserContainer from "./PhaserContainer.vue";
</script>

<template>
  <Suspense>
    <PhaserContainer />
    <template #fallback>
      <div>Downloading ...</div>
    </template>
  </Suspense>
</template>
