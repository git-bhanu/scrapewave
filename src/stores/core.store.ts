import { defineStore } from 'pinia';
import {UrlItem} from "../core.types";

export const useCoreStore = defineStore('core', {
    state: () => ({
        leftNavigationState: true,
        totalDomainCount: 0,
        completedDomainCount: 0,
        allDomainData: [] as UrlItem[],
        scriptRunning: false,
        inProgressUrl: {
            id: 0,
            url: '-',
            emails: '',
            status: 'not_started',
        },
    }),
    getters: {
        leftNavigation(state) {
            return state.leftNavigationState;
        },
        isAllDomainProcessed(state) {
            return state.totalDomainCount === state.completedDomainCount
        },
    },
    actions: {
        toggleLeftNavigation() {
            this.leftNavigationState = !this.leftNavigationState;
        },
        toggleScriptRunning() {
            this.scriptRunning = !this.scriptRunning;
        },
        toggleScriptRunningStatus(value: boolean) {
            this.scriptRunning = value;
        },
        updateDomainCount(data) {
            this.totalDomainCount = data.total;
            this.completedDomainCount = data.completed;
        },
        updateTableData(data) {
            this.allDomainData = data;
        },
        updateInProgressUrl(data) {
            this.inProgressUrl = data
        },
        resetInProgressUrl() {
            this.inProgressUrl = {
                id: 0,
                url: '-',
                emails: '',
                status: 'not_started',
            }
        }
    }
})