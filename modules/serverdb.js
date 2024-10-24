const db = require('./database');

// 서버 상태 조회
async function getServerState(target) {
    return new Promise((resolve, reject) => {
        const query = target
            ? `SELECT * FROM server WHERE id = ?`
            : `SELECT * FROM server ORDER BY id DESC LIMIT 1`;
        
        const params = target ? [target] : [];
        
        db.get(query, params, (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row || {});
        });
    });
}

// 서버 로그 조회 (최근 1주일 로그)
async function getServerLogs(target) {
    return new Promise((resolve, reject) => {
        const weekInMillis = 7 * 24 * 60 * 60 * 1000; // 1주일 밀리초
        const now = Date.now();
        const oneWeekAgo = now - weekInMillis;

        const query = target
            ? `SELECT * FROM log WHERE name = ? AND created >= ? ORDER BY created DESC LIMIT 7`
            : `SELECT * FROM log WHERE created >= ? ORDER BY created DESC LIMIT 7`;

        const params = target ? [target, oneWeekAgo] : [oneWeekAgo];

        db.all(query, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// 서버 상태 업데이트
async function updateServerState(name, state) {
    return new Promise((resolve, reject) => {
        const created = Date.now();
        const query = `INSERT INTO log (name, state, created) VALUES (?, ?, ?)`;
        db.run(query, [name, state, created], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

module.exports = {
    getServerState,
    getServerLogs,
    updateServerState
};