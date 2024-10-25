const puppeteer = require('puppeteer');
const { insertNews } = require('./newsdb'); // 데이터베이스 모듈 호출

// 크롤링 함수
async function crawlNews() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    //로그 찍을때
    //page.on('console', (msg) => console.log(msg.text()));

    const query = '노인 복지';
    let articles = [];

    for (let pageIndex = 1; pageIndex <= 10; pageIndex += 1) {
        const url = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodeURIComponent(query)}&start=${pageIndex * 10 - 9}`;

        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.dsc_thumb img');
        await new Promise((page) => setTimeout(page, 30000));

        const newArticles = await page.evaluate(() => {
            const results = [];
            const items = document.querySelectorAll('.news_wrap');

            items.forEach(item => {
                const title = item.querySelector('.news_tit')?.textContent;

                //썸네일
                let thumb = null;
                const thumbElement = item.querySelector('.dsc_thumb img');
                
                if (thumbElement) {
                    thumb = thumbElement.src;

                    const match = thumb.match(/(.*\.(jpg|jpeg|png|gif))/i);
                    if (match) {
                        thumb = match[1];
                    } else {
                        thumb = null;
                    }
                }

                const content = item.querySelector('.dsc_txt_wrap')?.textContent?.substring(0, 200);
                const url = item.querySelector('.news_tit')?.href?.trim(); // URL 공백 제거

                // "몇 시간 전" 정보를 여러 info 요소에서 찾아서 필터링
                const infoElements = item.querySelectorAll('.info');
                let relativeTime = null;

                infoElements.forEach(infoElement => {
                    const text = infoElement.innerText;
                    if (text.includes('일 전') || text.includes('시간 전') || text.includes('분 전') || text.includes('초 전')) {
                        relativeTime = text;  // 시간 정보가 담긴 요소 찾기
                    }
                });

                // 시간 계산
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
                    } else if (relativeTime.includes('초 전')) {
                        const secondsAgo = parseInt(relativeTime.match(/\d+/)?.[0], 10);
                        created = Date.now() - secondsAgo * 1000;
                    }
                }

                // 언론사 이름 가져오기
                const media = item.querySelector('.info_group > a')?.textContent?.trim();

                if (title && url) {
                    results.push({ title, thumb, content, url, created, media });
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
            await insertNews(article.thumb, article.title, article.content, 0, article.created, article.url, article.media);
        } catch (error) {
            console.log(`Insert error: ${article.title}`);
        }
    }

    return articles;
}

module.exports = {
    crawlNews,
};
