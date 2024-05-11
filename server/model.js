
import { database, databaseTableName } from "../server.js";

export default class Url {

    constructor(url) {
        this.id = url.id;
        this.url = url.url;
        this.status = url.status;
        this.error = url.error;
    }

    async setStatus(status) {
        return database.run(`UPDATE ${databaseTableName} SET status = ? WHERE id = ?`,
            status,
            this.id
        );
    }

    async setError(error) {
        return database.run(`UPDATE ${databaseTableName} SET error = ? WHERE id = ?`,
            error,
            this.id
        );
    }
}