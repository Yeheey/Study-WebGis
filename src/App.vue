<script setup>
import OlMap from './components/OlMap.vue'
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1>Study-WebGis</h1>
      <p>Vue 3 + OpenLayers 10 学习地图 — 覆盖常用 API 演示</p>
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
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
}

.header p {
  color: var(--text);
  font-size: 13px;
  margin: 0;
}

.main {
  flex: 1;
  min-height: 0;
}
</style>
