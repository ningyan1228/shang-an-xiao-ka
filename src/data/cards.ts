import type { KnowledgeCard } from '../types/knowledge';
const items: Array<Omit<KnowledgeCard, 'id'>> = [
  {question:'庄周又被称为什么？',answer:'南华真人。',explanation:'唐玄宗天宝元年追封庄子为南华真人，其著作《庄子》也被称为《南华经》。',mnemonic:'庄周梦蝶，南华真人。',category:'人文',topic:'道家',tags:['庄子','诸子百家'],difficulty:1},
  {question:'“庄周梦蝶”体现了什么思想？',answer:'体现了道家对物我关系、真实与梦境边界的思考。',explanation:'故事以梦蝶引出“物化”的哲思，强调万物变化与主体认知的相对性。',mnemonic:'梦蝶问真，物我相通。',category:'人文',topic:'道家',tags:['庄子','哲学'],difficulty:2},
  {question:'我国第一部较系统的封建成文法典是什么？',answer:'《法经》，由李悝制定。',explanation:'《法经》是战国时期魏国李悝制定的法典，对后世封建法制有重要影响。',mnemonic:'李悝写《法经》。',category:'法律',topic:'法家',tags:['法制史','李悝'],difficulty:1},
  {question:'为什么说宪法是国家根本法？',answer:'它规定国家最根本、最重要的问题，具有最高法律效力，制定和修改程序更严格。',explanation:'宪法是其他法律的立法依据，任何法律不得同宪法相抵触。',mnemonic:'内容最根本，效力最高，程序最严。',category:'法律',topic:'宪法',tags:['宪法','根本法'],difficulty:2},
  {question:'我国宪法修改由谁通过，需要多少票？',answer:'由全国人民代表大会以全体代表的三分之二以上多数通过。',explanation:'注意是全体代表的三分之二以上，不是到会代表。',mistakeTip:'不要混淆“全体代表”和“到会代表”。',category:'法律',topic:'宪法',tags:['人大','宪法修改'],difficulty:2},
  {question:'墨子的主要思想有哪些？',answer:'兼爱、非攻、尚贤、节用。',explanation:'墨家主张兼相爱、交相利，反对不义战争，重视贤能与节俭。',mnemonic:'兼爱非攻，尚贤节用。',category:'人文',topic:'墨家',tags:['墨子','诸子百家'],difficulty:1},
  {question:'“文景之治”发生在哪个朝代？',answer:'西汉。',explanation:'汉文帝、汉景帝时期实行轻徭薄赋、与民休息政策，社会经济得到恢复发展。',mnemonic:'文景治世在西汉。',category:'历史',topic:'汉代',tags:['西汉','治世'],difficulty:1},
  {question:'科举制度正式创立于哪个朝代？',answer:'隋朝。',explanation:'隋炀帝始设进士科，标志着科举制度正式创立。',mnemonic:'隋朝进士，科举开篇。',category:'历史',topic:'隋唐',tags:['科举','隋朝'],difficulty:1},
  {question:'《史记》的作者是谁？',answer:'司马迁。',explanation:'《史记》是中国第一部纪传体通史，记述上起黄帝下至汉武帝时期的历史。',mnemonic:'迁写史记，纪传通史。',category:'历史',topic:'史学',tags:['司马迁','史记'],difficulty:1},
  {question:'四大发明中，活字印刷术的发明者是谁？',answer:'北宋毕昇。',explanation:'毕昇发明胶泥活字印刷术，比欧洲活字印刷早四百多年。',mnemonic:'北宋毕昇，活字留名。',category:'科技',topic:'古代科技',tags:['四大发明','印刷术'],difficulty:1},
  {question:'我国第一颗人造地球卫星叫什么？',answer:'东方红一号。',explanation:'1970年4月24日，东方红一号成功发射，中国成为第五个自主发射人造卫星的国家。',mnemonic:'东方红一号，1970上天。',category:'科技',topic:'航天',tags:['航天','卫星'],difficulty:1},
  {question:'地球自转一周约需要多长时间？',answer:'24小时。',explanation:'以太阳为参照，地球完成一次自转形成一个昼夜，约为24小时。',mnemonic:'地球自转，一日二十四。',category:'地理',topic:'地球运动',tags:['地球','自转'],difficulty:1},
  {question:'我国面积最大的省级行政区是哪里？',answer:'新疆维吾尔自治区。',explanation:'新疆维吾尔自治区面积约166万平方千米，是我国陆地面积最大的省级行政区。',mnemonic:'最大省区在新疆。',category:'地理',topic:'中国地理',tags:['新疆','行政区'],difficulty:1},
  {question:'长江最终注入哪个海域？',answer:'东海。',explanation:'长江发源于青藏高原，流经多个省区，在上海市崇明岛以东注入东海。',mnemonic:'长江东流入东海。',category:'地理',topic:'河流',tags:['长江','东海'],difficulty:1},
  {question:'通货膨胀通常指什么？',answer:'一般物价水平持续上涨、货币购买力下降的经济现象。',explanation:'它是宏观经济中的价格现象，不等同于某一种商品涨价。',mnemonic:'物价普涨，购买力降。',category:'经济',topic:'宏观经济',tags:['通胀','物价'],difficulty:2},
  {question:'市场配置资源主要通过什么机制实现？',answer:'价格、供求和竞争机制。',explanation:'市场价格反映供求变化，引导生产要素流向效率更高的领域。',mnemonic:'价格供求加竞争。',category:'经济',topic:'市场经济',tags:['市场','资源配置'],difficulty:1},
  {question:'我国的根本政治制度是什么？',answer:'人民代表大会制度。',explanation:'人民代表大会制度是中国人民当家作主的根本途径和最高实现形式。',mnemonic:'根本制度，人大制度。',category:'政治',topic:'政治制度',tags:['人大','制度'],difficulty:1},
  {question:'中国共产党的根本组织原则是什么？',answer:'民主集中制。',explanation:'民主集中制是在民主基础上的集中和在集中指导下的民主相结合。',mnemonic:'民主基础，集中指导。',category:'政治',topic:'党的建设',tags:['民主集中制','组织'],difficulty:2},
  {question:'世界上面积最大的海洋是什么？',answer:'太平洋。',explanation:'太平洋面积约占世界海洋总面积的一半，是面积最大、最深的海洋。',mnemonic:'海洋最大太平洋。',category:'趣味',topic:'世界地理',tags:['海洋','世界之最'],difficulty:1},
  {question:'“五岳”之首是哪座山？',answer:'泰山。',explanation:'五岳为东岳泰山、西岳华山、南岳衡山、北岳恒山、中岳嵩山。',mnemonic:'五岳之首是泰山。',category:'趣味',topic:'文化常识',tags:['五岳','泰山'],difficulty:1},
  {question:'我国国旗上的大星代表什么？',answer:'中国共产党。',explanation:'五星红旗中大星代表中国共产党，四颗小星代表人民群众。',mnemonic:'一大四小，党与人民。',category:'政治',topic:'国家象征',tags:['国旗','常识'],difficulty:1},
  {question:'人体中最大的器官是什么？',answer:'皮肤。',explanation:'皮肤覆盖人体表面，具有保护、感觉、调节体温等作用。',mnemonic:'最大器官是皮肤。',category:'科技',topic:'生命科学',tags:['人体','生物'],difficulty:1},
  {question:'京杭大运河沟通了哪五大水系？',answer:'海河、黄河、淮河、长江、钱塘江。',explanation:'京杭大运河是世界上里程最长、工程最大的古代运河之一。',mnemonic:'海黄淮长钱，运河一线牵。',category:'地理',topic:'中国地理',tags:['运河','水系'],difficulty:2},
  {question:'“青花瓷”主要以哪种颜色为装饰？',answer:'蓝色。',explanation:'青花瓷以钴料着色，在白瓷上绘制纹样，经高温烧成呈蓝色。',mnemonic:'白地蓝花青花瓷。',category:'趣味',topic:'文化常识',tags:['瓷器','艺术'],difficulty:1}
];
export const cards: KnowledgeCard[] = items.map((item, index) => ({ ...item, id: `card-${index + 1}` }));
export const categories = ['全部','法律','历史','人文','科技','地理','经济','政治','趣味'] as const;
