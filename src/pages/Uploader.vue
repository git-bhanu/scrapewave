<script setup>
import {computed, ref} from 'vue';
import axios from "axios";
import { updateDomainCount } from "@/composables/uploadDomainData.ts";
import { useCoreStore } from '@/stores/core.store.ts';

const coreStore = useCoreStore();

const inputFile = ref(null);

let isLoading = ref(false);
function handleFileUpload() {
  let formData = new FormData();
  formData.append('file', inputFile.value);
  isLoading.value = true;
  axios.post(`http://${window.location.host}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
  )
  .finally(() => {
    isLoading.value = false;
    updateDomainCount();
  })
}

function handleFlushDatabase() {
  isLoading.value = true;
  axios.delete(`http://${window.location.host}/delete-database`)
  .finally(() => {
    isLoading.value = false;
    updateDomainCount();
  })
}

</script>

<template>
  <v-container>
    <v-card elevation="2" class="pa-9" title="Upload Domain data through a CSV file">
      <v-form @submit.prevent>
        <v-file-input
            accept=".csv"
            label="Upload CSV"
            prepend-icon="mdi-file-delimited"
            v-model="inputFile"
            show-size
            :disabled="isLoading"
        ></v-file-input>
        <div>
          <v-btn
              class="mt-2"
              type="submit"
              @click="handleFileUpload"
              :disabled="inputFile === null"
          >Submit</v-btn>
          <div class="mt-10" v-if="!isLoading && true">
            <v-tooltip
                location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                    v-bind="props"
                    class="mt-2"
                    type="button"
                    @click="handleFlushDatabase"
                    :disabled="coreStore.totalDomainCount === 0"
                    color="red-accent-4"
                >
                  <v-icon>
                    mdi-delete
                  </v-icon>
                  Flush Datbase
                </v-btn>
                <p class="text-body-2 text-red-accent-2 mt-5">
                  <v-icon>
                    mdi-alert
                  </v-icon>
                  This button doesn't ask for confirmation, please be mindful before you do this action, or else you might loose your progress.</p>
              </template>
              <span>You won't be able to flush database when your script is running.</span>
            </v-tooltip>
          </div>
          <v-progress-circular v-if="isLoading" indeterminate></v-progress-circular>
        </div>

      </v-form>
    </v-card>
  </v-container>
</template>

<style scoped>
</style>
