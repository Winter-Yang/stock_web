// 时间线项目模型
class TimelineItem {
    constructor(data) {
        this.timestamp = data.timestamp;
        this.status = data.status;
    }
}

// 相关板块模型
class RelatedPlate {
    constructor(data) {
        this.plate_id = data.plate_id;
        this.plate_name = data.plate_name;
        this.plate_reason = data.plate_reason;
    }
}

// 涨停原因模型
class SurgeReason {
    constructor(data) {
        this.stock_reason = data.stock_reason;
        this.related_plates = data.related_plates?.map(plate => new RelatedPlate(plate)) || [];
    }
}

// 主要的涨停池数据模型
class LimitUpStock {
    constructor(data) {
        this.buy_lock_volume_ratio = data.buy_lock_volume_ratio;
        this.change_percent = data.change_percent;
        this.first_limit_up = data.first_limit_up;
        this.last_limit_down = data.last_limit_down;
        this.last_limit_up = data.last_limit_up;
        this.limit_timeline = {
            items: data.limit_timeline?.items?.map(item => new TimelineItem(item)) || []
        };
        this.limit_up_days = data.limit_up_days;
        this.m_days_n_boards_boards = data.m_days_n_boards_boards;
        this.m_days_n_boards_days = data.m_days_n_boards_days;
        this.non_restricted_capital = data.non_restricted_capital;
        this.price = data.price;
        this.stock_chi_name = data.stock_chi_name;
        this.surge_reason = new SurgeReason(data.surge_reason || {});
        this.symbol = data.symbol;
        this.total_capital = data.total_capital;
        this.turnover_ratio = data.turnover_ratio;
        this.yesterday_limit_up_days = data.yesterday_limit_up_days;
    }
}



function adjustDateIfWeekend(date) {
    // 确保输入为 Date 对象
    if (!(date instanceof Date)) {
        throw new Error("输入的值必须是 Date 对象");
    }

    // 获取星期几，0 表示周日，6 表示周六
    const dayOfWeek = date.getDay();

    // 如果是周六
    if (dayOfWeek === 6) {
        const previousDate = new Date(date);
        previousDate.setDate(date.getDate() - 1); // 减 1 天，返回周五
        return previousDate;
    }

    // 如果是周日
    if (dayOfWeek === 0) {
        const previousDate = new Date(date);
        previousDate.setDate(date.getDate() - 1); // 减 1 天，返回周六
        return previousDate;
    }

    // 如果不是周末，原样返回日期
    return date;
}

async function fetchLimitUpStocksDaily() {
    const now = adjustDateIfWeekend(new Date());
    console.log(now)
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 前置补零
    const day = (now.getDate()).toString().padStart(2, '0'); // 前置补零
    return fetchLimitUpStocks(year, month, day);
}

// 获取今日涨停池数据的方法
async function fetchLimitUpStocks(year, month,day) {
    try {
        const myDay = year + '-' + month + '-' + day;
        console.log("111111");
        console.log(myDay)
        // https://flash-api.xuangubao.com.cn/api/pool/detail?pool_name=limit_up&date=2025-03-13
        const response = await fetch('https://flash-api.xuangubao.com.cn/api/pool/detail?pool_name=limit_up');
        const data = await response.json();
        console.log('获取涨停池数据:', data);
        return data.data
            .filter(item => !item.stock_chi_name.toLowerCase().includes('st') && !item.stock_chi_name.toUpperCase().includes('ST'))
            .map(item => new LimitUpStock(item));
    } catch (error) {
        console.error('获取涨停池数据失败:', error);
        return [];
    }
}


// 获取昨日涨停池数据的方法
async function fetchYesterdayLimitUpStocks() {
    try {
        const response = await fetch('https://flash-api.xuangubao.com.cn/api/pool/detail?pool_name=yesterday_limit_up');
        const data = await response.json();
        console.log('获取昨日涨停池数据:', data);
        return data.data
            .filter(item => !item.stock_chi_name.toLowerCase().includes('st') && !item.stock_chi_name.toUpperCase().includes('ST'))
            .map(item => new LimitUpStock(item));
    } catch (error) {
        console.error('获取昨日涨停池数据失败:', error);
        return [];
    }
}

export { 
    LimitUpStock, 
    fetchLimitUpStocks, 
    fetchLimitUpStocksDaily,
    fetchYesterdayLimitUpStocks 
};