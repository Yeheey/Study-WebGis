<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'

const mapEl = ref(null)
let map = null

onMounted(() => {
  if (!mapEl.value) return

  map = new Map({
    target: mapEl.value,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([116.397428, 39.90923]),
      zoom: 5,
    }),
  })
})

onBeforeUnmount(() => {
  if (!map) return
  map.setTarget(null)
  map = null
})
</script>

<template>
  <div ref="mapEl" class="ol-map" />
</template>

<style scoped>
.ol-map {
  width: 100%;
  height: 100%;
}
</style>
