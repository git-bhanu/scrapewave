import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {databaseTableName} from "../server.js";


sqlite3.verbose();

export async function getDatabase(dbPath) {
    return await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}


export async function addUrlToDb(database, rows) {
    try {
        for (let i = 0; i < rows.length; i++) {
            await database.run(
                'INSERT OR IGNORE INTO "domain" (url, status, error) VALUES (:url, :status, :error)',
                {
                    ':url': rows[i].url,
                    ':status': rows[i].status ? rows[i].status : 'not_started',
                    ':error': rows[i].error ? rows[i].error : '',
                }
            );
        }
        return `Processed ${rows.length} urls`;
    } catch (e) {
        throw new Error(e);
    }
}

export async function getUrlData(database, type){
    if (type === 'completed') {
        return await database.all('SELECT * FROM domain WHERE status = :status1 OR status = :status2 OR status = :status3',
            {
                ':status1': 'completed',
                ':status2': 'error',
                ':status3': 'partially_completed',
            }
        )
    }
    return await database.all(
        `SELECT * FROM ${databaseTableName} LIMIT -1`
    );
}

export async function getDataToWorkOn(database) {
    return database.all('SELECT * FROM domain WHERE status = "not_started" OR status = "processing" ORDER BY ROWID ASC LIMIT 1')
    .then((data) => {
        if (data.length > 0) {
            return data;
        } else {
            return false;
        }
    });
}

export async function deleteTable(database) {
    return database.exec(`DELETE FROM ${databaseTableName}`);
}

export async function getStatusCount(database) {
    const queries = [
        database.get('SELECT COUNT(rowid) FROM domain'),
        database.get('SELECT COUNT(rowid) FROM domain WHERE status = :status1 OR status = :status2 OR status = :status3',
            {
                ':status1': 'completed',
                ':status2': 'error',
                ':status3': 'partially_completed',
            }
        )
    ]
    return Promise.all(queries)
        .then((data) => {
            return {
                completed: data[1]['COUNT(rowid)'],
                total: data[0]['COUNT(rowid)']
            };
        })
        .catch((e) => {
            throw new Error(e);
        })
}