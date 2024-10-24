const db = require('./database');

// 의견글 조회 (최신순으로 정렬 후 20개의 의견 반환)
async function getPosts(page = 1) {
    const offset = (page - 1) * 20;
    return new Promise((resolve, reject) => {
        const query = `SELECT id, title, content, author, created 
                       FROM communication 
                       WHERE method = 'post' 
                       ORDER BY created DESC 
                       LIMIT 20 OFFSET ?`;
        db.all(query, [offset], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// 댓글 조회 (특정 origin(게시글 id)로 조회)
async function getComments(origin) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, title, content, author, created 
                       FROM communication 
                       WHERE method = 'comment' AND origin = ? 
                       ORDER BY created DESC`;
        db.all(query, [origin], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// 의견글 작성
async function insertPost({ title, content, author }) {
    const query = `INSERT INTO communication (method, title, content, author, created) 
                   VALUES ('post', ?, ?, ?, ?)`;
    const created = Date.now(); // 현재 시간 타임스탬프
    return new Promise((resolve, reject) => {
        db.run(query, [title, content, author, created], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID); // 생성된 의견글 ID 반환
        });
    });
}

// 댓글 작성
async function insertComment({ origin, content, author }) {
    const created = Date.now(); // 현재 시간 타임스탬프
    return new Promise((resolve, reject) => {
        // 먼저 origin이 유효한지 확인 (origin이 실제 존재하는지 확인)
        const checkOriginQuery = `SELECT 1 FROM communication WHERE id = ? AND method = 'post'`;

        db.get(checkOriginQuery, [origin], (err, row) => {
            if (err) {
                return reject(new Error('Origin 체크 중 오류 발생: ' + err));
            }

            // origin이 없으면 에러 반환
            if (!row) {
                return reject(new Error('해당 origin이 존재하지 않습니다.'));
            }

            const query = `INSERT INTO communication (method, origin, content, author, created) 
                           VALUES ('comment', ?, ?, ?, ?)`;
            db.run(query, [origin, content, author, created], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID); // 생성된 댓글 ID 반환
            });
        });
    });
}

module.exports = {
    getPosts,
    getComments,
    insertPost,
    insertComment
};