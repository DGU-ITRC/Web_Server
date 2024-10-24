const express = require('express');
const router = express.Router();
const { getServerState, getServerLogs, updateServerState } = require('../module/serverdb');

// 서버 상태 조회
router.get('/state', async (req, res) => {
    try {
        const target = req.query.target;
        const serverState = await getServerState(target);
        res.json(serverState);
    } catch (err) {
        console.error("서버 상태 조회 중 오류 발생:", err);
        res.status(500).json({ error: '서버 상태를 가져오지 못했습니다.' });
    }
});

// 서버 상태 로그 조회
router.get('/log', async (req, res) => {
    try {
        const target = req.query.target;
        const logs = await getServerLogs(target);
        res.json(logs);
    } catch (err) {
        console.error("서버 상태 로그 조회 중 오류 발생:", err);
        res.status(500).json({ error: '서버 로그를 가져오지 못했습니다.' });
    }
});

// 서버 상태 업데이트
router.post('/state', async (req, res) => {
    try {
        const { name, state } = req.body;
        if (!name || !state) {
            return res.status(400).json({ error: '서버 이름 및 상태를 입력해주세요.' });
        }
        await updateServerState(name, state);
        res.json({ message: '서버 상태가 성공적으로 업데이트되었습니다.' });
    } catch (err) {
        console.error("서버 상태 업데이트 중 오류 발생:", err);
        res.status(500).json({ error: '서버 상태를 업데이트하지 못했습니다.' });
    }
});

module.exports = router;
