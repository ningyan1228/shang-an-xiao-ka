const topicNames: Record<string, string> = {
  'east-west-jin': '两晋', 'ming-early': '明朝前期', 'ming-late': '明朝中后期', 'northern-southern': '南北朝', 'qin-dynasty': '秦朝', 'song-yuan': '宋元', 'three-kingdoms': '三国', 'northern-song': '北宋', 'sui-dynasty': '隋朝', 'tang-dynasty': '唐朝', 'late-tang-five-dynasties': '唐末五代', 'western-han': '西汉',
  'lotus-flower-god': '十二花神·荷花', 'chrysanthemum-flower-god': '十二花神·菊花', 'pomegranate-flower-god': '十二花神·榴花', 'plum-blossom-god': '十二花神·梅花', 'hibiscus-flower-god': '十二花神·芙蓉', 'camellia-flower-god': '十二花神·山茶', 'osmanthus-flower-god': '十二花神·桂花', 'peony-flower-god': '十二花神·芍药', 'hollyhock-flower-god': '十二花神·蜀葵', 'narcissus-flower-god': '十二花神·水仙', 'peach-blossom-god': '十二花神·桃花', 'apricot-blossom-god': '十二花神·杏花',
  'fifth-constitutional-amendment': '第五次宪法修正', 'world-constitutions': '世界宪法', 'constitution-basics': '宪法概念与原则', 'constitution-structure': '宪法典结构', 'constitution-features': '宪法特征', 'chinese-constitutional-history': '中国宪法史', 'civil-rights-religion-compensation': '公民基本权利', 'civil-rights-overview': '公民基本权利', 'social-economic-cultural-rights': '社会经济文化教育权利', 'citizen-duties': '公民义务', 'equality-political-supervision-rights': '平等与政治权利',
  'other-schools': '诸子百家·其他流派', 'confucianism': '儒家', 'chinese-mathematics': '中国数学史', 'water-projects': '水利工程', 'four-inventions-medicine': '四大发明与医学', 'chinese-medicine': '中国医学史', 'astronomy-calendar': '天文历法', 'daoism': '道家', 'chinese-geography': '地理', 'legalism-school': '法家', 'mohism-military-school': '墨家与兵家', 'agriculture-handicraft': '农业与手工业'
};

export function getImportTopicName(slug: string) {
  return topicNames[slug] ?? slug.split('-').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}
