const puppeteer = require('puppeteer');
const { insertNews } = require('./database'); // 데이터베이스 모듈 호출

// 크롤링 함수
async function crawlNews() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const query = '노인 복지';
    let articles = [];

    for (let pageIndex = 1; pageIndex <= 10; pageIndex += 1) {
        const url = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodeURIComponent(query)}&start=${pageIndex * 10 - 9}`;
        
        await page.goto(url, { waitUntil: 'networkidle2' });

        const newArticles = await page.evaluate(() => {
            const results = [];
            const items = document.querySelectorAll('.news_wrap');

            items.forEach(item => {
                const title = item.querySelector('.news_tit')?.textContent;
                let thumb = null;
                
                // 두 번째 img 태그에서 썸네일을 가져옴
                const imgs = item.querySelectorAll('img');
                if (imgs.length > 1) {
                    let thumbUrl = imgs[1].src;
                    if (thumbUrl) {
                        // 확장자까지 잘라내기 (type= 부분 제거)
                        const match = thumbUrl.match(/(.*\.(jpg|jpeg|png|gif))/i);
                        if (match) {
                            thumb = match[1];
                        }
                    }
                }

                const content = item.querySelector('.dsc_txt_wrap')?.textContent?.substring(0, 200);
                const url = item.querySelector('.news_tit')?.href?.trim().toLowerCase(); // URL을 소문자로 변환하고 공백 제거

                // "몇 시간 전"을 계산해서 created 값을 설정
                let relativeTime = item.querySelector('.info')?.innerText;
                let created = Date.now();

                if (relativeTime) {
                    if (relativeTime.includes('일 전')) {
                        const daysAgo = parseInt(relativeTime.match(/\d+/)?.[0], 10);
                        created = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
                    } else if (relativeTime.includes('시간 전')) {
                        const hoursAgo = parseInt(relativeTime.match(/\d+/)?.[0], 10);
                        created = Date.now() - hoursAgo * 60 * 60 * 1000;
                    } else if (relativeTime.includes('분 전')) {
                        const minutesAgo = parseInt(relativeTime.match(/\d+/)?.[0], 10);
                        created = Date.now() - minutesAgo * 60 * 1000;
                    }
                }

                if (title && url) {
                    results.push({ title, thumb, content, url, created });
                }
            });

            return results;
        });

        articles = articles.concat(newArticles);
        if (articles.length >= 100) break; // 100개 이상 크롤링하면 중단
    }

    await browser.close();

    for (const article of articles) {
        try {
            await insertNews(article.thumb, article.title, article.content, 0, article.created, article.url);
        } catch (error) {
            console.log(`중복된 기사: ${article.title}`);
        }
    }

    return articles;
}

module.exports = {
    crawlNews,
};
