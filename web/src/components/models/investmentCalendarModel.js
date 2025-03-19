import http from '/src/components/Utils/request.js'
// 主题模型
class Theme {
    constructor(data) {
        this.timeline_theme_id = data.timeline_theme_id;
        this.name = data.name;
    }
}

// 时间线模型
class Timeline {
    constructor(data) {
        this.article_id = data.article_id;
        this.timeline_id = data.timeline_id;
        this.date = data.date;
        this.grade = data.grade;
        this.source = data.source;
        this.create_time = data.create_time;
        this.theme_list = data.theme_list?.map(theme => new Theme(theme)) || [];
    }
}


// 文章模型
class Article {
    constructor(data) {
        this.article_id = data.article_id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.content = data.content;
        this.like_count = data.like_count;
        this.comment_count = data.comment_count;
        this.forward_count = data.forward_count;
        this.is_like = data.is_like;
        this.is_step = data.is_step;
        this.timeline = new Timeline(data.timeline || {});
        this.source = this.timeline.source;
    }
}

// 日历项模型
class CalendarItem {
    constructor(data) {
        this.date = data.date;
        this.list = data.list?.map(article => new Article(article)) || [];
    }
}

// 获取投资日历数据的方法
async function fetchCalendarData(year, month) {
    try {
        console.log(String(year)+"-"+String(month))
        const response = await http.post('https://app.jiuyangongshe.com/jystock-app/api/v1/timeline/list', {
            date: String(year)+"-"+String(month),
          });
          console.log(response.data)
          const data = response.data;
          return data.map(item => new CalendarItem(item));
    } catch (error) {
        console.error('获取投资日历数据失败:', error);
        // 返回模拟数据用于开发
        return [];
    }
}
export { 
    CalendarItem,
    Article,
    Timeline,
    Theme,
    fetchCalendarData
};