// 获取同花顺热门板块排行数据
async function fetchBlockRank() {
    try {
        const response = await fetch('/api/10jqka/pick/block/block_hotspot/hotspot/v1/hot_block_list?type=con&field=zf', {
            headers: {
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (json.status_code !== 0 || !json.data?.data_list) {
            console.error('板块排行接口返回异常:', json);
            return null;
        }

        const result = {};

        // 解析 data_list，按日期组织数据
        json.data.data_list.forEach(dateEntry => {
            const date = dateEntry.date; // "2026-04-24"
            result[date] = dateEntry.block_list.map(item => ({
                name: item.name,
                price: parseFloat(item.info.zf).toFixed(2) // zf 即涨幅%，如 "2.4873" -> "2.49"
            }));
        });

        // 按日期倒序排列
        const reversedResult = Object.keys(result)
            .sort((a, b) => new Date(b) - new Date(a))
            .reduce((acc, date) => {
                acc[date] = result[date];
                return acc;
            }, {});

        console.log('获取板块排行数据日期', Object.keys(reversedResult));
        return reversedResult;
    } catch (error) {
        console.error('获取板块排行数据失败:', error);
        return null;
    }
}

export {
    fetchBlockRank
};
