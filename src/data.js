// Local scene coordinates are deliberately compressed for an artistic city diorama.
// These are not survey coordinates, GIS boundaries, or navigable road data.
export const landmarks = [
  { id: 'pingan', name: '平安金融中心', english: 'PING AN FINANCE CENTER', district: '福田', tag: '城市天际线', x: 12, z: 10, height: 49, kind: 'spire', color: '#b9cbc2', description: '向天空延伸的银色棱线，勾勒福田中心区的鲜明轮廓。从这里俯瞰，读懂深圳向上生长的城市性格。' },
  { id: 'spring', name: '中国华润大厦', english: 'CHINA RESOURCES TOWER', district: '南山', tag: '春笋地标', x: -64, z: 4, height: 34, kind: 'bamboo', color: '#b2c3ce', description: '被称为“春笋”的流线形塔楼，伫立在深圳湾畔。纤细的立面纹理与收拢的塔冠，呼应一座城市的生长。' },
  { id: 'kk100', name: '京基 100', english: 'KINGKEY 100', district: '罗湖', tag: '罗湖天际线', x: 70, z: -2, height: 37, kind: 'arch', color: '#adc3bc', description: '修长的弧形塔冠与密集的城市街区相映，连接罗湖的生活记忆与现代天际线。' },
  { id: 'civic', name: '深圳市民中心', english: 'SHENZHEN CIVIC CENTER', district: '福田', tag: '城市公共空间', x: 12, z: -19, height: 8.4, kind: 'wing', color: '#467383', footprint: [18, 10], focusZoom: 3, focusOffset: [-90, 175, 65], description: '蓝色曲面大屋顶舒展如翼，黄色圆塔与红色方塔穿出屋面。开阔的市民广场、建筑与莲花山共同构成城市中轴。' },
  { id: 'stadium', name: '深圳湾体育中心', english: 'SHENZHEN BAY SPORTS CENTER', district: '南山', tag: '春茧地标', x: -89, z: -4, height: 6, kind: 'oval', color: '#c6d0b2', footprint: [16, 8], focusZoom: 3.4, focusOffset: [-80, 190, 125], description: '“春茧”的连续白色网壳覆盖场馆，椭圆开口露出内部看台与球场。细密的交叉结构将海湾边的体育空间连成一体。' },
  { id: 'shunhing', name: '地王大厦', english: 'SHUN HING SQUARE', district: '罗湖', tag: '城市记忆', x: 88, z: -13, height: 30, kind: 'twin', color: '#aac7c1', description: '双尖塔与青绿色立面，是许多人记忆里的深圳地标。它见证着罗湖街区与城市天际线的变迁。' },
  { id: 'universiade', name: '深圳大运中心', english: 'SHENZHEN UNIVERSIADE CENTER', district: '龙岗', tag: '水晶石场馆群', x: 58, z: -85, height: 8, kind: 'crystal', color: '#a5c9bf', footprint: [23, 13], focusZoom: 3, focusOffset: [70, 160, -120], description: '开敞的主体育场、圆形体育馆与长方形游泳馆组成“一场两馆”。三角形玻璃和折叠钢结构构成水晶石般的建筑外壳，水面与步道连接起场馆群。' },
  { id: 'redcube', name: '深圳·红立方', english: 'SHENZHEN RED CUBE', district: '龙岗', tag: '公共文化地标', x: 107, z: -85, height: 7, kind: 'redcube', color: '#9b354d', footprint: [20, 6.5], focusZoom: 3.1, focusOffset: [50, 115, -140], description: '四组倾斜的红色建筑沿狭长场地展开，连续窗带与细密竖向板材勾勒外墙。建筑之间的开放通道，将公共文化空间与城市广场连接起来。' },
  { id: 'airport', name: '宝安机场 T3', english: 'SHENZHEN AIRPORT · TERMINAL 3', district: '宝安', tag: '蜂窝表皮 · 航空门户', x: -138, z: -100, height: 6, kind: 'airport', color: '#c6d5d8', footprint: [22, 25], focusZoom: 3.4, focusOffset: [85, 180, 110], description: '流线形主楼与十字指廊延展在停机坪上。模型细化了起伏的白色屋顶、蜂窝表皮、玻璃端面和登机桥，保留 T3 的有机轮廓。', reference: { label: 'Fuksas 建筑设计', url: 'https://fuksas.com/zh/shenzen-airport/' } },
  { id: 'northstation', name: '深圳北站', english: 'SHENZHEN NORTH RAILWAY STATION', district: '龙华', tag: '交通枢纽 · 悬挑屋盖', x: -43, z: -103, height: 7, kind: 'northstation', color: '#c5d0d1', footprint: [23, 24], focusZoom: 3.3, focusOffset: [60, 130, 150], description: '宽阔屋盖以“上平下曲”的剖面形成悬挑入口。玻璃候车厅、平行屋面肋、站台雨棚和轨道共同构成这座龙华交通枢纽的结构特征。', reference: { label: '国家铁路局 · 站房介绍', url: 'https://www.nra.gov.cn/ztzl/hy/gcjs2023/sljj/201403/t20140307_344188.shtml' } },
  { id: 'guangming', name: '光明文化艺术中心', english: 'GUANGMING CULTURE & ART CENTER', district: '光明', tag: '光明之眼 · 叠合庭院', x: -84, z: -153, height: 9.4, kind: 'guangming', color: '#d5d7c9', footprint: [21, 23], focusZoom: 4.4, focusOffset: [75, 100, 155], description: '白色体量围合起多个庭院，临水立面的弧形入口形成“光明之眼”。模型加入了开放拱洞、金色内衬、竖向幕墙、屋顶庭院和前方水池。', reference: { label: '香港建筑师学会 · 项目资料', url: 'https://www.hkia.net/en/awards-gallery/6/cross-strait-architectural-design-awards/detail/96' } },
  { id: 'pingshan', name: '坪山大剧院', english: 'PINGSHAN PERFORMING ARTS CENTER', district: '坪山', tag: '戏剧盒子 · 空中步道', x: 160, z: -91, height: 11, kind: 'pingshan', color: '#a9bec6', footprint: [16, 14], focusZoom: 4.4, focusOffset: [95, 115, 130], description: '方正的“戏剧盒子”以银色铝制表皮包裹深红色剧场。架空入口、沿外墙上升的公共步道和屋顶花园，将建筑连接到周边公共空间。', reference: { label: 'OPEN 建筑事务所', url: 'https://www.openarch.com/task/121' } },
  { id: 'dapeng', name: '大鹏所城 · 南门', english: 'DAPENG FORTRESS · SOUTH GATE', district: '大鹏', tag: '古城门楼 · 岭南街巷', x: 209, z: -9, height: 8.2, kind: 'dapeng', color: '#ad9980', footprint: [20, 15], focusZoom: 4.2, focusOffset: [65, 90, 160], description: '南门城楼的拱形门洞、分层砖石、城垛、木构门楼与灰瓦翘檐构成主要轮廓。后方配以传统民居和巷道，表达所城的历史街区形态。', reference: { label: '深圳市政府 · 大鹏新区博物馆', url: 'https://www.sz.gov.cn/szzt2010/szwtt/wtcg/whcg/content/post_11171158.html' } },
  { id: 'yantian', name: '盐田港', english: 'YANTIAN INTERNATIONAL CONTAINER TERMINAL', district: '盐田', tag: '蓝色岸桥 · 集装箱码头', x: 151, z: -8, height: 13, kind: 'yantian', color: '#6595a4', footprint: [23, 17], focusZoom: 3.3, focusOffset: [90, 140, 130], description: '蓝色岸桥、桁架吊臂、拉索和成排集装箱，构成盐田港鲜明的工业轮廓。模型同时表现装卸区、码头边缘水面与靠泊集装箱船，布局和数量经过压缩。', reference: { label: '盐田国际 · 港区资料', url: 'https://www.yict.com.cn/index.html?locale=zh_CN' } },
  { id: 'huawei', name: '坂田 · 华为总部 F1', english: 'BANTIAN · HUAWEI HEADQUARTERS F1', district: '龙岗', subdistrict: '坂田', tag: '坂田基地 · 弧形幕墙', x: 10, z: -147, height: 22.2, kind: 'huawei', color: '#468193', footprint: [18, 13], focusZoom: 4.5, focusOffset: [65, 100, 150], description: '参考深圳坂田基地 F1 实景，细化宽幅微凹玻璃立面、连续窗格、金属侧框和多层檐口。两侧附楼、水景和树阵用于表达总部园区空间，属于压缩布局。', reference: { label: '华为官方 · 坂田 F1 实景', url: 'https://www.huawei.com/en/media-center/multimedia/photos/bantian-f1-hq-skyscraper' } },
  { id: 'yungu', name: '坂田 · 天安云谷', english: 'BANTIAN · TIAN AN CLOUD PARK', district: '龙岗', subdistrict: '坂田', tag: '产业园区 · 立体连廊', x: 9, z: -102, height: 24.6, kind: 'yungu', color: '#788fa9', footprint: [14, 15], focusZoom: 4.4, focusOffset: [-100, 125, 130], description: '以坂田天安云谷已建园区的蓝灰玻璃塔楼、竖向边框、水平挑板和错落屋冠为外形参考，组合多栋高层、绿化裙房、步行连廊及开放庭院。园区楼栋数量与间距为示意。', reference: { label: '天安骏业 · 坂田天安云谷', url: 'https://www.szyungu.com/service.shtml' } },
];

export const districtLabels = [
  { name: '宝安', english: 'BAO’AN', x: -140, z: -136 },
  { name: '南山', english: 'NANSHAN', x: -67, z: -22 },
  { name: '福田', english: 'FUTIAN', x: 9, z: -42 },
  { name: '罗湖', english: 'LUOHU', x: 74, z: -36 },
  { name: '龙岗', english: 'LONGGANG', x: 89, z: -114 },
  { name: '盐田', english: 'YANTIAN', x: 152, z: -30 },
  { name: '龙华', english: 'LONGHUA', x: -42, z: -135 },
  { name: '光明', english: 'GUANGMING', x: -87, z: -177 },
  { name: '坪山', english: 'PINGSHAN', x: 160, z: -115 },
  { name: '大鹏', english: 'DAPENG NEW DISTRICT', x: 210, z: -38 },
];

export const subdistrictLabels = [{ name: '坂田', english: 'BANTIAN · LONGGANG', x: 10, z: -125 }];

export function seededRandom(seed = 518000) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
