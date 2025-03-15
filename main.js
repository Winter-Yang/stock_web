const app = express();
const https = require('https');


app.use(cors());


//start app 
const port = process.env.PORT || 8081;

app.listen(port, async () => {
    console.log(`App is listening on port:${port}. you can open if run test http://localhost:${port}/`);
  }
);



app.get('/api/cdn/domainlist',function (req, res){
    try {
        // 解析 JSON 字符串
        const jsonData = JSON.parse(data);
        
        // 添加自定义 header
        res.setHeader('X-Cdn-Version', 'a0bc1f0edff7471db41f58d0da0d9c40'); // 设置 X-Cdn-Version 头
        
        // 返回 JSON 数据
        res.json(jsonData);
    } catch (parseErr) {
        // 处理 JSON 解析错误
        res.status(400).json({ error: 'Invalid JSON format' });
    }
})

