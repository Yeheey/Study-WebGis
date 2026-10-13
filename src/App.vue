<script setup>
import OlMap from './components/OlMap.vue'
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1>Study-WebGis</h1>
      <p>Vite + Vue 3 + OpenLayers</p>
    </header>
    <main class="main">
      <OlMap />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100svh;
}

.header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0;
}

.header p {
  color: var(--text);
  font-size: 14px;
}

.main {
  flex: 1;
  min-height: 0;
}
</style>
