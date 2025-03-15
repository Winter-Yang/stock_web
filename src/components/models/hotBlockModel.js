import http from '../Utils/request'

// 板块模型
class BlockItem {
    constructor(data) {
        this.code = data.code || '';
        this.name = data.name || '';
        this.market = data.market || '';
        this.type = data.type || '';
        this.zf = data.info.zf;
    }
}

// 每日板块数据模型
class DailyBlockData {
    constructor(data) {
        this.date = data.date || '';
        this.block_list = data.block_list?.map(block => new BlockItem(block)) || [];
    }
}
export const fetchHotBlocks = async (type = 'con') => {
  try {
    const response = await http.get('https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/hot_block_list?type=con&field=zf')
    // const data = response.data.date_list;
    console.log(response);
    return data.map(item => new DailyBlockData(item));

  } catch (error) {
    console.error('获取热门板块数据失败:', error)
    throw error
  }
}