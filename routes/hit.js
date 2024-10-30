const express = require("express");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");
const router = express.Router();

// Google Analytics 서비스 계정 키 파일 경로
const keyFilePath = path.join(__dirname, "../dgu-itrc-fd5238a5b133.json");

// Google Analytics API 클라이언트 초기화
const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyFilePath,
});

// Google Analytics에서 방문자 데이터를 가져오는 함수
async function getVisitorData() {
    const propertyId = "465289728";

    // 금일 방문자 데이터 요청
    const [responseToday] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
    });

    // 누적 방문자 데이터 요청
    const [responseTotal] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "2015-08-14", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
    });
    console.log(responseToday);
    console.log(responseTotal);

    const todayVisitors = responseToday.rows[0].metricValues[0].value;
    const totalVisitors = responseTotal.rows[0].metricValues[0].value;

    return { today: todayVisitors, total: totalVisitors };
}

// /analytics 엔드포인트 정의
router.get("/", async (req, res) => {
    try {
        const data = await getVisitorData();
        res.json(data);
    } catch (error) {
        console.warn("Error fetching analytics data");
        res.json({ today: 0, total: 0 });
    }
});

module.exports = router;
