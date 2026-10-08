# 新增建筑参考与建模范围

核对日期：2026-09-30。通过建筑设计方、运营方、建筑师学会或政府公开资料核对外形；照片仅用于目视参考，不作为项目纹理资源、下载素材或导出内容。

| 片区 / 模型 | 主要参考 | 模型保留的特征 | 简化范围 |
| --- | --- | --- | --- |
| 宝安 / 机场 T3 | [Fuksas 官方项目](https://fuksas.com/zh/shenzen-airport/) | 流线主楼、十字指廊、起伏屋面、蜂窝格构、端面玻璃与登机桥 | 缩短指廊；面板采用几何结构线表现，非每块铝板或玻璃的施工网格 |
| 龙华 / 深圳北站 | [国家铁路局站房资料](https://www.nra.gov.cn/ztzl/hy/gcjs2023/sljj/201403/t20140307_344188.shtml) | 上平下曲的屋盖、大悬挑、平行屋面肋、玻璃幕墙、轨道与雨棚 | 压缩站场和配套楼，不包含完整综合换乘枢纽 |
| 光明 / 文化艺术中心 | [香港建筑师学会项目资料与实景](https://www.hkia.net/en/awards-gallery/6/cross-strait-architectural-design-awards/detail/96)、[光明区政府介绍](https://www.szgm.gov.cn/english/news/galleries/content/post_11526156.html) | 白色庭院体量、巨大弧形入口、金色内衬、临水前场、屋顶庭院 | 只建外部可辨识结构，不建剧场内部和全部室内楼梯 |
| 坪山 / 大剧院 | [OPEN 官方项目](https://www.openarch.com/task/121) | 方形戏剧盒子、银色外皮、深红核心体量、外部步道与屋顶花园 | 外皮穿孔以结构线简化，步道和花园按视觉尺度压缩 |
| 大鹏 / 所城南门 | [深圳市政府：大鹏新区博物馆](https://www.sz.gov.cn/szzt2010/szwtt/wtcg/whcg/content/post_11171158.html) | 拱形门洞、分层砖石、城垛、木构门楼、灰瓦屋面与翘檐 | 后方民居为传统形态示意，不代表古城全部房屋和街巷的现状测绘 |
| 盐田 / 盐田港 | [盐田国际官方港区影像](https://www.yict.com.cn/index.html?locale=zh_CN) | 蓝色岸桥、框架支腿、水平吊臂、拉索、码头、堆场与货船 | 表达典型码头设施，岸桥和集装箱数量、装卸状态及船型不对应实时港区 |
| 龙岗坂田 / 华为总部 F1 | [华为官方 F1 实景照片，摄影来源 Huawei](https://www.huawei.com/en/media-center/multimedia/photos/bantian-f1-hq-skyscraper)、[华为坂田园区介绍](https://digitalpower.huawei.com/resource/public/campus/en/index.html) | 宽幅微凹蓝色玻璃立面、密集窗格、金属侧框及层叠檐口 | 仅 F1 外形为重点参考，附楼、水景和树阵为园区空间示意；未使用东莞松山湖欧洲小镇造型 |
| 龙岗坂田 / 天安云谷 | [天安骏业运营方资料](https://www.szyungu.com/service.shtml)、[深圳市规划和自然资源局二期项目资料](https://pnr.sz.gov.cn/d-cyyf/homeDetailSeoServlet?id=5FEB5BBCFCC54D6D8B8080C8D2D2D708) | 蓝灰玻璃塔楼、金属边框、水平挑板、屋冠、裙房与立体步行空间 | 参考已建园区外形组织四栋代表塔楼，并非一期或二期楼栋的完整复刻；没有把未来方案当作竣工实景 |
| 龙岗坂田 / 赣锋科技大厦 | [深圳市规划和自然资源局项目资料](https://pnr.sz.gov.cn/d-cyyf/homeDetailSeoServlet?id=f9b3cd4a6a13406aa4dbada8af13d5c4) | 两栋研发办公楼、蓝绿玻璃幕墙、共享裙房与入口前场 | 依据项目公开信息建立双塔示意，塔身尺寸、层高、场地与幕墙分格均按沙盘比例简化 |
| 龙岗坂田 / 星河双子塔 | [AECOM 官方项目](https://aecom.com/cn/projects/shenzhen-galaxy-twin-towers/)、[深圳市政府项目介绍](https://www.sz.gov.cn/cn/zjsz/fwts_1_3/tzfw/tzhj/content/post_10533516.html) | 两座等高塔楼、圆润渐扭的玻璃轮廓、连续裙房与顶部收分 | 参考设计方项目外形；塔身结构、楼层、裙房曲面与高度经艺术化压缩，不用于测绘 |

本项目采用可交互的程序化几何重建。建筑的辨识特征参考真实对象，尺寸、朝向、城区间距和相邻环境采用艺术化压缩。既有八处地标的参考来源见 README。全部模型、结构线和场馆内部均随 GLB 导出。

## 山海连城生态节点

主脊沿现有示意绿道标为“鲲鹏径”，西侧标出凤凰山、阳台山、塘朗山、梅林山和银湖山等节点，东侧连接梧桐山、马峦山与七娘山；莲花山、笔架山、东湖、大沙河、仙湖及深圳湾红树林作为公园与滨海支线标注。路线分段与公园连接关系参考[深圳市公园城市建设总体规划暨三年行动计划](https://www.sz.gov.cn/zfgb/2023/gb1272/content/post_10389162.html)。模型坐标、区界归属文字与线路长度为视觉示意，非 GIS 线路或精确行政边界。
