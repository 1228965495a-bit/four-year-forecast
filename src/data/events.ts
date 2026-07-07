// 学期事件数据。每个事件包含 2-3 个选项，选项各自带效果 + 系统吐槽反馈。
// 数值使用新的属性体系（obsession/battery/filter/gpa/illusion/escape + 隐藏 mouthHard/hairline）。

import type { CharStats } from "@/lib/gameStore";

export type EventCategory = "学业" | "社交" | "休闲" | "实习" | "健康" | "劝退" | "特殊";

export type SceneKey =
  | "classroom"
  | "library"
  | "dorm"
  | "canteen"
  | "field"
  | "club"
  | "office"
  | "corridor";

export interface EventEffect {
  key: keyof CharStats;
  delta: number;
}

export interface EventOption {
  label: string;
  effects: EventEffect[];
  /** 系统吐槽（一句话反馈） */
  feedback: string;
}

export interface GameEvent {
  id: string;
  scene: SceneKey;
  category: EventCategory;
  title: string;
  description: string;
  options: EventOption[];
}

export const EVENTS: GameEvent[] = [
  {
    id: "first_class",
    scene: "classroom",
    category: "学业",
    title: "开学第一节专业课",
    description: "老师讲了 5 分钟就开始点名。你的座位刚好在最前排。",
    options: [
      {
        label: "全神贯注听讲，还做了笔记",
        effects: [
          { key: "gpa", delta: 8 },
          { key: "obsession", delta: 6 },
          { key: "battery", delta: -4 },
        ],
        feedback: "你合上笔记本时，隐约觉得自己选对了专业。滤镜暂时保住。",
      },
      {
        label: "偷偷看手机",
        effects: [
          { key: "battery", delta: 4 },
          { key: "gpa", delta: -5 },
          { key: "escape", delta: 3 },
        ],
        feedback: "老师看了你一眼，你假装在查 PPT 补充资料。嘴硬 +1。",
      },
      {
        label: "边听边偷偷开小差记灵感",
        effects: [
          { key: "obsession", delta: 3 },
          { key: "filter", delta: 2 },
          { key: "gpa", delta: -1 },
        ],
        feedback: "你觉得自己找到了这门课的浪漫版本。（老师并不觉得）",
      },
    ],
  },
  {
    id: "read_dropout_post",
    scene: "dorm",
    category: "劝退",
    title: "刷到本专业劝退帖",
    description: "凌晨两点，你认真看完了一篇《XX 专业毕业三年后我做了保安》。",
    options: [
      {
        label: "看完，深呼吸，告诉自己“其实还好”",
        effects: [
          { key: "filter", delta: -12 },
          { key: "escape", delta: 8 },
          { key: "mouthHard", delta: 5 },
        ],
        feedback: "你已经开始用「其实还好」掩盖事实。",
      },
      {
        label: "点了个收藏，转头继续背知识点",
        effects: [
          { key: "gpa", delta: 6 },
          { key: "filter", delta: -4 },
          { key: "battery", delta: -6 },
        ],
        feedback: "焦虑没有消失，只是被复习进度条盖住了。",
      },
      {
        label: "关掉手机，做了一份转专业攻略",
        effects: [
          { key: "escape", delta: 14 },
          { key: "obsession", delta: -10 },
          { key: "illusion", delta: -6 },
        ],
        feedback: "转专业名单已经加了收藏夹，但你还没点提交。",
      },
    ],
  },
  {
    id: "library_grind",
    scene: "library",
    category: "学业",
    title: "图书馆通宵备考",
    description: "距离考试还有 36 小时，你带着咖啡和续命零食坐进了 401。",
    options: [
      {
        label: "肝到底，能救一分是一分",
        effects: [
          { key: "gpa", delta: 14 },
          { key: "battery", delta: -16 },
          { key: "hairline", delta: -3 },
        ],
        feedback: "你交卷时手在抖，但心里踏实了。发际线沉默地退了一步。",
      },
      {
        label: "看不进去，改成划水收藏 20 篇公众号",
        effects: [
          { key: "battery", delta: 6 },
          { key: "gpa", delta: -6 },
          { key: "filter", delta: -3 },
        ],
        feedback: "系统提示：你把复习变成了拖延艺术。",
      },
      {
        label: "组队去开黑，考完再说",
        effects: [
          { key: "battery", delta: 10 },
          { key: "escape", delta: 6 },
          { key: "gpa", delta: -10 },
        ],
        feedback: "你笑得最大声，但心里已经开始盘算补考日程。",
      },
    ],
  },
  {
    id: "join_club",
    scene: "club",
    category: "社交",
    title: "社团招新摆摊",
    description: "学长学姐眼里带光地喊：加入我们，四年不孤单。",
    options: [
      {
        label: "报了两个感兴趣的",
        effects: [
          { key: "battery", delta: 8 },
          { key: "obsession", delta: 4 },
          { key: "gpa", delta: -3 },
        ],
        feedback: "你在群里被艾特了 17 次，但心情很好。",
      },
      {
        label: "报了学生会，冲一冲履历",
        effects: [
          { key: "illusion", delta: 10 },
          { key: "battery", delta: -6 },
          { key: "mouthHard", delta: 4 },
        ],
        feedback: "你告诉自己：这段经历以后一定有用。（真的吗）",
      },
      {
        label: "谁都不报，回宿舍打游戏",
        effects: [
          { key: "battery", delta: 10 },
          { key: "escape", delta: 3 },
          { key: "obsession", delta: -3 },
        ],
        feedback: "你享受了独处，代价是同学都开始互相认识了。",
      },
    ],
  },
  {
    id: "canteen_encounter",
    scene: "canteen",
    category: "社交",
    title: "食堂偶遇同专业前辈",
    description: "TA 端着一份糖醋里脊坐到你对面，开始讲行业「真相」。",
    options: [
      {
        label: "认真听，还追问了实习",
        effects: [
          { key: "illusion", delta: -8 },
          { key: "escape", delta: 6 },
          { key: "filter", delta: -6 },
        ],
        feedback: "前辈嘴角挂着不易察觉的苦笑，你的滤镜又薄了一层。",
      },
      {
        label: "礼貌笑笑，转移话题聊糖醋里脊",
        effects: [
          { key: "battery", delta: 4 },
          { key: "mouthHard", delta: 3 },
          { key: "filter", delta: 2 },
        ],
        feedback: "你选择先保护今天的心情。滤镜厚度维持稳定。",
      },
      {
        label: "反手劝前辈：还有救",
        effects: [
          { key: "mouthHard", delta: 8 },
          { key: "obsession", delta: 4 },
          { key: "escape", delta: -3 },
        ],
        feedback: "前辈愣了一下，然后笑着帮你续了饮料。你也不知道谁在劝谁。",
      },
    ],
  },
  {
    id: "find_intern",
    scene: "office",
    category: "实习",
    title: "第一次投实习",
    description: "凌晨改简历到三点，你把「精通」两个字反复删了又加。",
    options: [
      {
        label: "海投 30 家，广撒网",
        effects: [
          { key: "illusion", delta: 12 },
          { key: "battery", delta: -10 },
          { key: "mouthHard", delta: 6 },
        ],
        feedback: "你收到了 3 个已读、1 个婉拒、26 个已读不回。",
      },
      {
        label: "只投一家 dream 公司，认真准备",
        effects: [
          { key: "illusion", delta: 6 },
          { key: "obsession", delta: 8 },
          { key: "battery", delta: -8 },
        ],
        feedback: "你把 JD 背了下来，进了二面。故事未完。",
      },
      {
        label: "算了，先摆一学期",
        effects: [
          { key: "battery", delta: 12 },
          { key: "illusion", delta: -8 },
          { key: "escape", delta: 5 },
        ],
        feedback: "你告诉自己「简历要慢工出细活」——你朋友已经拿到 offer 了。",
      },
    ],
  },
  {
    id: "field_run",
    scene: "field",
    category: "健康",
    title: "被拉去操场跑步",
    description: "室友举着一瓶电解质水站在你床边：走，跑两圈。",
    options: [
      {
        label: "去了，跑完还多加了两圈",
        effects: [
          { key: "battery", delta: 14 },
          { key: "hairline", delta: 2 },
          { key: "gpa", delta: -2 },
        ],
        feedback: "傍晚风吹得你觉得人生还有希望。",
      },
      {
        label: "钻进被窝拒绝",
        effects: [
          { key: "battery", delta: 4 },
          { key: "escape", delta: 4 },
          { key: "hairline", delta: -2 },
        ],
        feedback: "被子确实赢了。但你的作息又向后推了 2 小时。",
      },
      {
        label: "去了但走了两圈就摸回来",
        effects: [
          { key: "battery", delta: 6 },
          { key: "mouthHard", delta: 3 },
        ],
        feedback: "你说自己在拉伸，其实在刷手机。",
      },
    ],
  },
  {
    id: "group_project",
    scene: "classroom",
    category: "学业",
    title: "小组作业分工",
    description: "6 个人的组，5 个人在群里已读，剩下你和 deadline。",
    options: [
      {
        label: "一个人扛下来，做完发群里",
        effects: [
          { key: "gpa", delta: 8 },
          { key: "battery", delta: -12 },
          { key: "mouthHard", delta: 8 },
        ],
        feedback: "你在评价里给自己打了满分。心里那口气还没顺过来。",
      },
      {
        label: "在群里艾特所有人开腾讯会议",
        effects: [
          { key: "obsession", delta: -3 },
          { key: "battery", delta: -4 },
          { key: "filter", delta: -4 },
        ],
        feedback: "会议开完，你多了 3 个 PDF、5 个「我在忙」和 0 个进度。",
      },
      {
        label: "偷偷改了名单，只留三个人交",
        effects: [
          { key: "gpa", delta: 4 },
          { key: "escape", delta: 5 },
          { key: "mouthHard", delta: 4 },
        ],
        feedback: "分数出来那天，你收到了三条来自消失队友的私聊。",
      },
    ],
  },
  {
    id: "dorm_chat",
    scene: "dorm",
    category: "特殊",
    title: "宿舍卧谈会",
    description: "关灯以后，室友突然问：你觉得咱们专业真的还行吗？",
    options: [
      {
        label: "疯狂夸自己专业",
        effects: [
          { key: "mouthHard", delta: 10 },
          { key: "obsession", delta: 4 },
          { key: "filter", delta: 4 },
        ],
        feedback: "你越说越大声，但心里也在自我怀疑。嘴硬浓度报表。",
      },
      {
        label: "如实说：我也不知道",
        effects: [
          { key: "filter", delta: -6 },
          { key: "battery", delta: 6 },
          { key: "escape", delta: 3 },
        ],
        feedback: "说出来那一刻你反而轻松了。这是难得的坦白时刻。",
      },
      {
        label: "把话题带偏到八卦",
        effects: [
          { key: "battery", delta: 5 },
          { key: "filter", delta: 2 },
          { key: "obsession", delta: -2 },
        ],
        feedback: "宿舍气氛回到轻松，你成功躲过一次灵魂拷问。",
      },
    ],
  },
  {
    id: "corridor_advisor",
    scene: "corridor",
    category: "特殊",
    title: "走廊偶遇辅导员",
    description: "TA 招手叫住你：来来来，我这有个「机会」。",
    options: [
      {
        label: "假装没听见，加速离开",
        effects: [
          { key: "escape", delta: 6 },
          { key: "battery", delta: 4 },
          { key: "illusion", delta: -3 },
        ],
        feedback: "你成功保护了周末，代价是下次被点名做 PPT。",
      },
      {
        label: "笑着接过任务",
        effects: [
          { key: "gpa", delta: 4 },
          { key: "illusion", delta: 8 },
          { key: "battery", delta: -10 },
          { key: "mouthHard", delta: 4 },
        ],
        feedback: "你告诉自己「以后履历上会写上这一笔」。周末就这么没了。",
      },
      {
        label: "反问一句「有加分吗」",
        effects: [
          { key: "escape", delta: 3 },
          { key: "obsession", delta: -2 },
          { key: "illusion", delta: 3 },
        ],
        feedback: "辅导员愣了两秒，然后说：你去问上一届。",
      },
    ],
  },
  {
    id: "weekend_trip",
    scene: "corridor",
    category: "休闲",
    title: "周末短途出走",
    description: "朋友喊你去邻校吃顿好的，还想去拍照发小红书。",
    options: [
      {
        label: "去了，拍到深夜",
        effects: [
          { key: "battery", delta: 12 },
          { key: "filter", delta: 6 },
          { key: "gpa", delta: -4 },
        ],
        feedback: "回来路上你觉得世界还挺可爱。",
      },
      {
        label: "取消，说要复习",
        effects: [
          { key: "gpa", delta: 5 },
          { key: "escape", delta: 4 },
          { key: "battery", delta: -4 },
        ],
        feedback: "打开书 30 分钟你就开始刷别人的旅行 vlog。",
      },
    ],
  },
  {
    id: "cert_grind",
    scene: "library",
    category: "学业",
    title: "刷证书 / 备考大礼包",
    description: "群里有人开始晒证书截图，你不动摇是不可能的。",
    options: [
      {
        label: "跟风报名 3 门考试",
        effects: [
          { key: "gpa", delta: 6 },
          { key: "illusion", delta: 10 },
          { key: "battery", delta: -10 },
          { key: "hairline", delta: -2 },
        ],
        feedback: "题库背到怀疑人生，但简历上多了三行字。",
      },
      {
        label: "研究一晚上，决定还是先摆",
        effects: [
          { key: "battery", delta: 6 },
          { key: "illusion", delta: -6 },
          { key: "escape", delta: 4 },
        ],
        feedback: "你告诉自己「明天再开始」。明天没有开始。",
      },
    ],
  },
];

export function pickEvents(step: number, n = 1): GameEvent[] {
  // 简单确定性伪随机，避免每次渲染重新洗牌
  const arr = [...EVENTS];
  const seed = (step + 1) * 9301 + 49297;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = ((seed * (i + 3)) >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
