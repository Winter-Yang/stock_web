const express = require('express');
const https = require('https');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码格式的请求体
app.use(fileUpload()); // 处理文件上传
//start app 
const port = process.env.PORT || 8233;

app.listen(port, async () => {
    console.log(`App is listening on port:${port}. you can open if run test http://localhost:${port}/`);
  }
);

function executeScript(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

app.post('/get_bankuai_lists', async (req, res) => {
  const scriptPath = 'script';
  const scriptName = 'bankuai_list_api.py';
  const fullPath = path.join(__dirname, `${scriptPath}/${scriptName}` )
  console.log(`YWD 开始请求**** ${fullPath} `);
  try {
    const command = `python3 ${fullPath}`;
    executeScript(command)
    .then(result => {
      const jsonData = JSON.parse(result.match(/\{.*\}/));
      console.log(`YWD 请求结果**** ${jsonData}`);
      return res.status(200).json({ data: jsonData });
    })
    .catch(error => {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ error: '无效的响应格式' });
    });
  } catch (error) {
    console.log(`YWD 请求异常**** ${error.message}`);
      res.status(500).json({ error: error.message });
  }
});


















// 处理其他所有路由，返回 index.html
app.use(express.static(path.join(__dirname,'web', 'YHybrid')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'web', 'YHybrid', 'index.html'));
});
// 处理所有路由请求
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'web','YHybrid', 'index.html'));
});


app.post('/file/upload', async (req, res) => {
  try {
    console.log('file upload');
        // 处理文件上传
    const file = req.files.file;

    // 检查路径
    const filePath = req.files.path ? req.files.path.data.toString() : null;
    const targetDir = path.join(__dirname, "static","uploads");
    const toPath = filePath ? path.join(targetDir, filePath) : targetDir;

    // 确保目标目录存在
    if (!fs.existsSync(toPath)) {
      fs.mkdirSync(toPath, { recursive: true });
    }

    console.log(`Moving file to: ${toPath}/${file.name}`);
    
    // 移动文件到目标位置
    file.mv(path.join(toPath, file.name), (err) => {
      if (err) {
        console.log('file upload error');
        return res.status(500).json({ errCode: '-1',errMsg: err.message,data:{} });
      }
      console.log('file upload success');
      res.status(200).json({ errCode: '0',errMsg: '',data:{} });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errCode: '-1',errMsg: err.message,data:{} });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});