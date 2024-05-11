import axios from 'axios';
import {useCoreStore} from "../stores/core.store";

export function updateDomainCount() {
    const coreStore = useCoreStore();
    axios.get(`http://${window.location.host}/domain-count`,
    )
    .then((res) => {
        coreStore.updateDomainCount(res.data.data);
    })
}

export function getAllDomains() {
    const coreStore = useCoreStore();
    axios.get(`http://${window.location.host}/all-domain`,
    )
    .then((res) => {
        coreStore.updateTableData(res.data.data.map((item) => {
            return {
                ...item,
            }
        }));
    })
}

export function syncStatus() {
    const coreStore = useCoreStore();
    axios.get(`http://${window.location.host}/status`,
    )
    .then((res) => {
        coreStore.toggleScriptRunningStatus(res.data.data.scriptRunning);
    })
}