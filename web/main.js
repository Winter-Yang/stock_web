const app = express();
const https = require('https');


app.use(cors());


//start app 
const port = process.env.PORT || 8081;

app.listen(port, async () => {
    console.log(`App is listening on port:${port}. you can open if run test http://localhost:${port}/`);
  }
);

// 处理其他所有路由，返回 index.html
app.use(express.static(path.join(__dirname, 'YHybrid')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'YHybrid', 'index.html'));
});
// 处理所有路由请求
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'YHybrid', 'index.html'));
});

