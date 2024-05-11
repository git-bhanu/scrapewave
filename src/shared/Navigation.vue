<script setup>
import { useCoreStore } from '@/stores/core.store.ts';
import {io} from "socket.io-client";

const coreStore = useCoreStore();

const socket = io();
socket.on('update_scraping', (data) => {
  coreStore.updateDomainCount(data.newCount);
})
</script>

<template>
  <v-navigation-drawer v-model="coreStore.leftNavigationState">
    <v-list>
      <v-list-item prepend-icon="mdi-search-web" link title="Home" to="/">
        <template v-slot:append>
          <v-badge color="primary" :content="`${coreStore.completedDomainCount} / ${coreStore.totalDomainCount}`" inline>
          </v-badge>
        </template>
      </v-list-item>
      <v-list-item prepend-icon="mdi-upload-box-outline" title="Data" to="/upload" ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
