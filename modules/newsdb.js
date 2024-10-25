const db = require('./database');

// 비동기 방식으로 데이터 삽입
async function insertNews(thumb, title, content, count, created, url) {
    return new Promise((resolve, reject) => {
        // 먼저 중복된 URL이 있는지 확인
        db.get('SELECT * FROM news WHERE url = ?', [url.trim()], (err, row) => {
            if (err) {
                console.error('중복 확인 중 오류 발생:', err);
                return reject(err);
            }

            // 중복이 없으면 삽입
            if (!row) {
                const stmt = db.prepare('INSERT INTO news (thumb, title, content, count, created, url, media) VALUES (?, ?, ?, ?, ?, ?, ?)');
                stmt.run(thumb, title, content, count, created, url.trim(), (err) => {
                    if (err) {
                        console.error('데이터 삽입 중 오류 발생:', err);
                        return reject(err);
                    }
                    resolve();
                });
                stmt.finalize();
            } else {
                //console.log(`이미 존재하는 기사: ${title}`);
                resolve(); // 중복된 경우에도 resolve 처리
            }
        });
    });
}

//주어진 기준으로 주어진 수량만큼 SELECT
async function getNews(orderBy = 'created', limit = 20, page = 1) {
    return new Promise((resolve, reject) => {
        //SQL injection 방지
        const validOrderBy = orderBy === 'created' || orderBy === 'count' ? orderBy : 'created';
        const subOrderBy = validOrderBy === 'created' ? 'count' : 'created';

        const offset = (page - 1) * limit;
        const query = `SELECT * FROM news 
                   ORDER BY ${validOrderBy} DESC, ${subOrderBy} DESC 
                   LIMIT ? OFFSET ?`;
                   
        db.get('SELECT COUNT(*) as count FROM news', (err, row) => {
            if (offset >= row.count ) {
                limit = 0;
            }

            db.all(query, [limit, offset], (err, rows) => {
                if (err) {
                    console.error("뉴스 불러오는 중 에러 발생:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });

    });
}

//주어진 기준으로 주어진 수량만큼 SELECT
async function getHotNews(orderBy = 'count', limit = 5, page = 1) {
    return new Promise((resolve, reject) => {
        //SQL injection 방지
        const validOrderBy = orderBy === 'created' || orderBy === 'count' ? orderBy : 'created';
        const subOrderBy = validOrderBy === 'created' ? 'count' : 'created';

        const offset = (page - 1) * limit;
        const query = `SELECT * FROM news 
                   WHERE thumb IS NOT NULL
                   ORDER BY ${validOrderBy} DESC, ${subOrderBy} DESC 
                   LIMIT ? OFFSET ?`;

        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                console.error("뉴스 불러오는 중 에러 발생:", err);
                return reject(err);
            }
            resolve(rows);
        });
    });
}

//뉴스 count 증가
async function incrementNewsCount(id) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE news SET count = count + 1 WHERE id = ?`;

        db.run(query, [id], function (err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return reject(new Error('News not found'));
            }
            resolve({ message: 'Increment Success' });
        });
    });
}

module.exports = {
    insertNews,
    getNews,
    getHotNews,
    incrementNewsCount
};