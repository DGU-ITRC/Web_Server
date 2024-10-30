var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var schedule = require('node-schedule');
var cors = require('cors');

var indexRouter = require('./routes/index');
var newsRouter = require('./routes/news');
var communicationRouter = require('./routes/communication');
var serverRouter = require('./routes/server');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/news', newsRouter);
app.use('/api/communication', communicationRouter);
app.use('/api/server', serverRouter);

//크롤링 세팅
const { crawlNews } = require('./modules/crawl');

schedule.scheduleJob('0 0 * * *', async () => {
    try {
        console.log('스케줄된 크롤링 실행 중...');
        await crawlNews();  // 비동기 크롤링 함수 호출
        console.log('크롤링 완료');
    } catch (error) {
        console.error('스케줄된 크롤링 중 오류 발생:', error);
    }
});
//프로그램 실행시 크롤링 한번 동작
try{
    await crawlNews();
    console.error("최초 크롤링 완료");
} catch(error) {
    console.error("최초 크롤링 중 에러 발생", error);
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
