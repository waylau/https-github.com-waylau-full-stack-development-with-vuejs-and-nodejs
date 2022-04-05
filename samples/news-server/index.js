const express = require('express');
const app = express();
const port = 8089; // 指定端口号
const auth = require('basic-auth');
const bodyParser = require('body-parser');
app.use(bodyParser.json()) // 用于解析 application/json
const MongoClient = require('mongodb').MongoClient;

// 连接URL
const url = 'mongodb://127.0.0.1:27017';

// 数据库名称
const dbName = 'nodejsBook';

// 创建MongoClient客户端
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/admins/hi', (req, res) => {

    var credentials = auth(req)

    // 登录认证检验
    if (!credentials || !check(credentials.name, credentials.pass)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
    }

    res.send('hello')
});

// 创建新闻
app.post('/admins/news', (req, res) => {

    var credentials = auth(req)

    // 登录认证检验
    if (!credentials || !check(credentials.name, credentials.pass)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
    }

    let news = req.body;
    console.info(news);

    // 使用连接方法来连接到服务器
    client.connect(function (err) {
        if (err) {
            console.error('error end: ' + err.stack);
            return;
        }

        console.log("成功连接到服务器");

        const db = client.db(dbName);

        // 插入新闻
        insertNews(db, news, function () {
        });
    });

    // 响应成功
    res.status(200).end();
});


// 插入新闻
const insertNews = function (db, _news, callback) {
    // 获取集合
    const news = db.collection('news');

    // 插入文档
    news.insertOne({
        title: _news.title, content: _news.content, creation: _news.creation
    })
        .then(function (result) {
            console.log("已经插入文档，响应结果是：");
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
            console.log("插入失败");
        });
}

// 检查权限
const check = function (name, pass) {
    var valid = false;

    // 判读账号密码是否匹配
    if (('waylau' === name) && ('123456' === pass)) {
        valid = true;
    }
    return valid
}

// 查询新闻列表
app.get('/news', (req, res) => {

    // 使用连接方法来连接到服务器
    client.connect(function (err) {
        if (err) {
            console.error('error end: ' + err.stack);
            return;
        }

        console.log("成功连接到服务器");

        const db = client.db(dbName);

        // 插入新闻
        findNewsList(db, function (result) {
            // 响应成功
            res.status(200).json(result);
        });
    });

});


// 查找全部新闻标题
const findNewsList = function (db, callback) {
    // 获取集合
    const news = db.collection('news');

    // 查询文档
    news.find({}).toArray(function (err, result) {
        console.log("查询所有文档，结果如下：");
        console.log(result)
        callback(result);
    });
}

app.listen(port, () => console.log(`Server listening on port ${port}!`));