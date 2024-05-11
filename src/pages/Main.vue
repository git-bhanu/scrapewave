<script setup>
import { useCoreStore } from '@/stores/core.store.ts';
import { onMounted } from "vue";
import { syncStatus} from "@/composables/uploadDomainData.ts";
import {io} from "socket.io-client";

const coreStore = useCoreStore();
const socket = io();

socket.on('update_scraping', (data) => {
  if (data.urlProcessed) {
    coreStore.updateInProgressUrl(data.urlProcessed)
  }
  coreStore.updateDomainCount(data.newCount);
  syncStatus();
})

onMounted(() => {
  syncStatus();
})
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
        <h1 class="text-h4">😎 Progress</h1>
      </template>
      <v-container>
        <v-row>
          <v-col>
            <div class="mt-4">
              <h2 class="text-h-5 d-flex">
                  <span class="mr-2">
                    <v-icon size="x-small" color="light-green" v-if="coreStore.scriptRunning" icon="mdi-circle"></v-icon>
                    <v-icon size="x-small" color="red" v-if="!coreStore.scriptRunning" icon="mdi-circle"></v-icon>
                  </span>
                {{ coreStore.inProgressUrl.url !== '-' ? coreStore.inProgressUrl.url : 'Paused' }}
                <v-badge color="primary" :content="`${coreStore.completedDomainCount} / ${coreStore.totalDomainCount}`" inline>
                </v-badge>
              </h2>
            </div>
            <div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>
