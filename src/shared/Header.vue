<script setup>
import { useCoreStore } from '@/stores/core.store.ts';
import axios from "axios";
import {computed} from "vue";
import {io} from "socket.io-client";
const coreStore = useCoreStore();

const socket = io();

socket.on('update_scraping', (data) => {
  coreStore.updateInProgressUrl(data.urlProcessed)
  if (coreStore.isAllDomainProcessed) {
    coreStore.toggleScriptRunningStatus(false);
  }
})

function handleToggle() {
  coreStore.toggleLeftNavigation();
}

function downloadCSV(type) {
  axios.post(`http://${window.location.host}/download-csv`, {
    type: type
  }).then((data) => {
    const csvData = arrayToCsv(data.data);
    const port = location.port || '' ;
    downloadBlob(csvData, `${type}-data-${(new Date()).toLocaleString()}-${port}.csv`, 'text/csv;charset=utf-8;')
  })
}

function arrayToCsv(data){
  return data.map(row =>
      row
          .map(String)  // convert every value to String
          .map(v => v.replaceAll('"', '""'))  // escape double quotes
          .map(v => `"${v}"`)  // quote it
          .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}

function downloadBlob(content, filename, contentType) {
  // Create a blob
  let blob = new Blob([content], { type: contentType });
  let url = URL.createObjectURL(blob);

  // Create a link to download it
  let pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
}

const buttonIcon = computed(() => {
  return coreStore.scriptRunning ? 'mdi-pause' : 'mdi-play';
})

const buttonText = computed(() => {
  return coreStore.scriptRunning ? 'Pause' : 'Start';
})

function handleStartPauseAction() {
  coreStore.toggleScriptRunning();
  coreStore.resetInProgressUrl();
  socket.emit('start_scraping', {
    runScript: coreStore.scriptRunning,
  });
}

</script>

<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click="handleToggle"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>ScrapeWave</v-app-bar-title>
    <div v-if="coreStore.scriptRunning" class="d-flex">
      <h2 class="text-body-1 pr-4 align-self-center">{{ coreStore.inProgressUrl.url }}</h2>
      <v-progress-circular
          :indeterminate="coreStore.scriptRunning"
          class="mr-4"
          color="primary"
      >
      </v-progress-circular>
    </div>

    <div class="d-flex">
      <v-btn
          :color="coreStore.scriptRunning ? 'red' : 'green'"
          variant="elevated"
          @click="handleStartPauseAction"
          rounded="0"
          :disabled="coreStore.isAllDomainProcessed"
          class="align-self-center mr-2"
      >
        <template v-slot:prepend>
          <v-icon :icon="buttonIcon">
          </v-icon>
        </template>
        {{ buttonText }}
      </v-btn>

      <v-btn
          id="menu-activator"
          type="submit"
          :disabled="coreStore.totalDomainCount === 0"
          color="primary"
          variant="flat"
      >
        <template v-slot:prepend>
          <v-icon>
            mdi-download
          </v-icon>
        </template>
        Download CSV
      </v-btn>
      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item :value="'all'" @click="downloadCSV('completed')">
            <v-list-item-title>Completed ({{ coreStore.completedDomainCount }} entries)</v-list-item-title>
          </v-list-item>
          <v-list-item :value="'only_completed'" @click="downloadCSV('all')">
            <v-list-item-title>All ({{ coreStore.totalDomainCount }} entries) </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>