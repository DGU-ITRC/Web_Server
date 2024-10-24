const express = require('express');
const router = express.Router();
const { getPosts, getComments, insertPost, insertComment } = require('../modules/communicationdb');

// 의견글 조회 (최신순으로 정렬 후 20개의 의견 반환)
router.get('/post', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1; // 기본 1페이지
    try {
        const posts = await getPosts(page);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 댓글 조회 (특정 origin(게시글 id)로 조회)
router.get('/comment', async (req, res) => {
    const origin = parseInt(req.query.origin, 10);
    if (isNaN(origin)) {
        return res.status(400).json({ error: 'Invalid origin ID' });
    }
    try {
        const comments = await getComments(origin);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 의견글 작성
router.post('/post', async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await insertPost({ title, content, author });
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error inserting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 댓글 작성
router.post('/comment', async (req, res) => {
    const { origin, content, author } = req.body;
    if (!origin || !content || !author || isNaN(origin)) {
        return res.status(400).json({ error: 'Missing required fields or invalid origin ID' });
    }

    try {
        await insertComment({ origin, content, author });
        res.status(201).json({ message: 'Comment created successfully' });
    } catch (error) {
        console.error('Error inserting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
