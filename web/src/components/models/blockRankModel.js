// 板块排行数据项模型
class BlockRankItem {
    constructor(data) {
        // data是数组格式，按位置解构
        const [
            code,           // 板块代码
            name,          // 板块名称
            price,         // 当前价格
            zdf,           // 涨跌幅
            hsl,           // 换手率
            cje,           // 成交额
            jlr,           // 净流入
            buy,           // 主买
            sell,          // 主卖
            rate,          // 占比
            zsz,           // 总市值
            zdd,           // 涨跌点
            zlr,           // 主力净流入
            ltsz,          // 流通市值
            jgcyd,         // 机构持仓异动
            pe,            // 市盈率
            pb,            // 市净率
            lastPrice,     // 最新价
            lastZdf        // 最新涨跌幅
        ] = data;

        this.code = code;
        this.name = name;
        this.price = price;
        this.zdf = zdf;
        this.hsl = hsl;
        this.cje = cje;
        this.jlr = jlr;
        this.buy = buy;
        this.sell = sell;
        this.rate = rate;
        this.zsz = zsz;
        this.zdd = zdd;
        this.zlr = zlr;
        this.ltsz = ltsz;
        this.jgcyd = jgcyd;
        this.pe = pe;
        this.pb = pb;
        this.lastPrice = lastPrice;
        this.lastZdf = lastZdf;
    }
}

// 板块排行响应数据模型
class BlockRankResponse {
    constructor(data) {
        this.list = data.list?.map(item => new BlockRankItem(item)) || [];
        this.time = data.Time;
        this.count = data.Count;
        this.day = data.Day;
        this.min = data.Min;
        this.max = data.Max;
        this.minDay = data.MinDay;
        this.title = data.Title;
        this.listSonInfo = data.list_soninfo?.map(item => new BlockRankItem(item)) || [];
        this.listSon = data.list_son || [];
        this.ttag = data.ttag;
        this.errcode = data.errcode;
    }
}

// 获取板块排行数据
async function fetchBlockRank() {
    try {
        const response = await fetch('http://localhost:8233/get_bankuai_lists', {
            method: 'POST'
        });
        
        const responseData = await response.json();
        // 处理数据，保持每个日期的数据独立
        const result = {};

        // 处理每个日期的数据
        Object.entries(responseData.data).forEach(([date, items]) => {
            // 为每个日期创建数据数组
            result[date] = items.map(item => ({
                code: item.code,
                name: item.name,
                price: item.price,
                zdf: item.zdf,
                cje: item.cje,
                jlr: item.jlr
            }));
        });

        console.log('获取板块排行数据日期', Object.keys(result));

        const reversedResult = Object.keys(result)
        .sort((a, b) => new Date(b) - new Date(a)) // 按日期倒序排列
        .reduce((acc, date) => {
            acc[date] = result[date]; // 按新顺序填充到新的对象
            return acc;
        }, {});
        // 输出处理后的数据
        console.log('处理后的数据:', reversedResult);
        return reversedResult;
    } catch (error) {
        console.error('获取板块排行数据失败:', error);
        return null;
    }
}

export {
    fetchBlockRank
};