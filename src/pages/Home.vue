<script setup>
import { useCoreStore } from '@/stores/core.store.ts';
import {computed, onMounted, ref} from "vue";
import { getAllDomains } from "@/composables/uploadDomainData.ts";
import {io} from "socket.io-client";

const coreStore = useCoreStore();

const statusMapper = {
  'not_started': {
    text: 'NOT STARTED',
    color: 'grey-darken-1'
  },
  'processing': {
    text: 'PROCESSING',
    color: 'amber-darken-3'
  },
  'completed': {
    text: 'COMPLETED',
    color: 'green-darken-1'
  },
  'partially_completed': {
    text: 'PARTIALLY COMPLETED',
    color: 'blue-darken-1'
  },
  'error': {
    text: 'ERROR',
    color: 'red-darken-1'
  },
}

const headers = [
  { title: 'ID', value: 'id' , width: '75px', sortable: true },
  { title: 'Status', value: 'status' , width: '75px', sortable: true},
  { title: 'URL', value: 'url', width: '300px', sortable: true },
  { title: 'Error', value: 'error', width: '400px', sortable: true },
]

function handleStartPauseAction() {
  coreStore.toggleScriptRunning();
  coreStore.resetInProgressUrl();
  socket.emit('start_scraping', {
    runScript: coreStore.scriptRunning,
  });
}

const socket = io();

socket.on('update_scraping', (data) => {
  coreStore.updateInProgressUrl(data.urlProcessed)
  if (coreStore.isAllDomainProcessed) {
    coreStore.toggleScriptRunningStatus(false);
  }
})


const search = ref('');

onMounted(() => {
  getAllDomains();
})

const buttonIcon = computed(() => {
  return coreStore.scriptRunning ? 'mdi-pause' : 'mdi-play';
})

const buttonText = computed(() => {
  return coreStore.scriptRunning ? 'Pause' : 'Start';
})

function openLink(url) {
  window.open(url,'_blank');
}

function updateTable() {
  getAllDomains();
}

</script>

<template>
  <v-container>
    <v-card elevation="2" class="pa-4">
      <v-progress-linear
          :active="coreStore.scriptRunning"
          :indeterminate="coreStore.scriptRunning"
          color="deep-purple-accent-4"
          absolute
          bottom
      ></v-progress-linear>
      <template v-slot:title>
        <h1 class="text-h4">Start Scraping</h1>
      </template>
      <v-container>
        <v-row>
          <v-col>
            <v-card-actions>
              <v-btn
                  :color="coreStore.scriptRunning ? 'red' : 'green'"
                  variant="elevated"
                  @click="handleStartPauseAction"
                  rounded="0"
                  :disabled="coreStore.isAllDomainProcessed"
              >
                <template v-slot:prepend>
                  <v-icon :icon="buttonIcon">
                  </v-icon>
                </template>
                {{ buttonText }}
              </v-btn>
            </v-card-actions>
            <div class="mt-4">
                <h2 class="text-h-5 d-flex">
                  <span class="mr-2">
                    <v-icon size="x-small" color="light-green" v-if="coreStore.scriptRunning" icon="mdi-circle"></v-icon>
                    <v-icon size="x-small" color="red" v-if="!coreStore.scriptRunning" icon="mdi-circle"></v-icon>
                  </span>
                  {{ coreStore.inProgressUrl && coreStore.inProgressUrl.url !== '-' ? coreStore.inProgressUrl.url : 'Paused' }}
                </h2>
            </div>
            <div>

            </div>

            <v-alert
                icon="mdi-message-alert"
                type="error"
                v-if="coreStore.isAllDomainProcessed"
            >
              <p class="text-white">
                You cannot start the script as you either don't have any data in the system or all the URL's are already processed.
                If you want to add more URL's go to <RouterLink to="/upload">Data</RouterLink> page.
              </p>
            </v-alert>
          </v-col>
        </v-row>
      </v-container>

        <v-text-field
            v-model="search"
            label="Search in the table"
            prepend-inner-icon="mdi-magnify"
            variant="underlined"
            hide-details
            single-line
            class="mb-5"
        ></v-text-field>

        <v-btn @click="updateTable"
              variant="elevated"
              rounded="0"
            >
            <v-icon size="large" color="white" icon="mdi-refresh"></v-icon>
          Update Table
        </v-btn>
      <v-data-table :items="coreStore.allDomainData" :search="search" :headers="headers" density="compact"
      >
        <!-- URL col -->
        <template v-slot:item.url="{ item }">
          <div>
            <h4 class="text-body-2"> {{ item.url }}
              <v-btn variant="plain" @click="openLink(item.url)">
                <v-icon color="blue">
                  mdi-open-in-new
                </v-icon>
              </v-btn>
            </h4>
          </div>
        </template>

        <!-- Status col -->
        <template v-slot:item.status="{ item }">
            <v-chip
                :color="statusMapper[item.status].color"
                :text="statusMapper[item.status].text"
                class="text-uppercase"
                size="small"
                label
            ></v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.truncate {
  max-width: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
