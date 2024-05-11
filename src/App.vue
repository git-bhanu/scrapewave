<script setup>
import { onMounted, computed } from 'vue'
import Navigation from "@/shared/Navigation.vue";
import Header from "@/shared/Header.vue";
import {getAllDomains, syncStatus, updateDomainCount} from "@/composables/uploadDomainData.ts";
import { useRoute } from 'vue-router'

const route = useRoute();
const path = computed(() =>route.path)

onMounted(() => {
  updateDomainCount();
  getAllDomains();
  syncStatus();
})
</script>

<template>
  <v-layout>
    <Header />
    <Navigation />
    <v-main style="min-height: 300px;">
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

  </v-layout>
</template>

<style scoped>
</style>
