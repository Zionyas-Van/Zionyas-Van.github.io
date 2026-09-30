// ============================================
// 视频数据文件
// ============================================

export interface Video {
	id: string; // 唯一标识
	title: string; // 视频标题
	bvid: string; // B站 BV 号，比如 "BV1xx411c7mD"
	cover: string; // 封面图（可选），留空则自动用 B站封面
	description: string; // 简短描述
	featured: boolean; // true = 显示在首页精选区
}

export const videos: Video[] = [
  {
    id: "BV1ZHVVzQERz",
    title: "【生存模组推荐】基岩版生存模组必备合集｜链接已附简介｜高亮显示、移动光源、小地图等等",
    bvid: "BV1ZHVVzQERz",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0l000dkicezra6qeyius187DIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "【生存模组推荐】基岩版生存模组必备合集｜链接已附简介｜高亮显示、移动光源、小地图等等 因为是第一条视频，没有什么经验，所以质量并不是很好，一直想找机会重新录一段，但想想还是算了。 —————— 视频中模组下载地址：https://www.123pan.com/s/wd3iVv-dasc3.html https://zionyas-van.github.io/posts/minecraft/survival-mods1/ (各位也可自行前往原作者下载站下载) 演示版本：基岩版1.21.71 测试设备：AndroidOne 11｜高通骁龙 说明：视频中提及到的模组以及上述下载链接的模组文件皆来源于网络，若您觉得侵犯到了您的权利，或者您并不想让其他人转发您的作品，请联系作者予以致歉并删除 —————— ●1. What Am I Looking At? (WAILA)(高亮显示) 原帖地址：https://mcpedl.com/waila/ 原作者：r4isen1920 —————— ●2.Raiyon's Dynamic Lightning(Raiyon移动光源) 原帖地址：https://mcpedl.com/raiyons-dynamic-light-addon 原作者：Lord Raiyon —————— ●3. 区块小地图 来源贴：https://klpbbs.com/forum.php?mod=viewthread&tid=146916&highlight=1.21%E5%B0%8F%E5%9C%B0%E5%9B%BE&page=1&extra=#pid10744680 (原作者未知，若有侵权，请联系作者予以致歉删除) —————— ●4. 农夫乐事 原帖地址：https://mcshelf.top/resources/A0152.html 原作者：上官汐，F.D.P —————— ●5.Raiyon的3D掉落物 原帖地址：https://mcpedl.com/raiyons-item-physics/ 原作者：Lord Raiyon —————— ●6. Falling Minerals and Trees（连锁采集树木和矿石）（附赠） 原帖地址：https://mcpedl.com/falling-minerals-and-trees/ 原作者：MJ ADDON —————— 视频制作不易，感谢大家支持！求三连！！！",
    featured: true,
  }
];
