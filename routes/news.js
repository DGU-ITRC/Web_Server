var express = require('express');
var router = express.Router();
const { getNews, getHotNews, incrementNewsCount } = require('../modules/newsdb'); // DB 모듈

// 뉴스 크롤링 실행 (GET /api/news/crawl)
/*
router.get('/crawl', async (req, res, next) => {
    try {
        const articles = await crawlNews();
        res.json({ message: '크롤링 완료', articles });
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
        next(error); // 에러 핸들링 미들웨어로 전달
    }
});
*/

// 저장된 뉴스 데이터 최신 20개 확인 (GET /api/news/new)
router.get('/new', async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1; // 기본 1페이지
    try {
        const rows = await getNews('created', 20, page);
        res.json(rows);
    } catch (err) {
        console.error('뉴스 데이터를 가져오는 중 오류 발생:', err);
        next(err);
    }
});

// 저장된 뉴스 데이터 인기순 20개 확인 (GET /api/news/hot)
router.get('/hot', async (req, res, next) => {
    try {
        const rows = await getHotNews('count', 5);
        res.json(rows);
    } catch (err) {
        console.error('뉴스 데이터를 가져오는 중 오류 발생:', err);
        next(err);
    }
});

//뉴스 카운트 증가
router.put('/count/:target', async (req, res) => {
    const newsId = req.params.target;

    try {
        const result = await incrementNewsCount(newsId);
        res.status(200).json(result);
    } catch (err) {
        console.error("조회수 증가 중 에러 발생:", err);

        if (err.message === 'News not found') {
            return res.status(404).json({ message: 'News not found' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
