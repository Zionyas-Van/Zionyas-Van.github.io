// src/components/GiscusComment.tsx

import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

const REPO = "Zionyas-Van/Zionyas-Van.github.io";
const REPO_ID = "R_kgDORQTmyQ";
const CATEGORY = "Announcements";
const CATEGORY_ID = "DIC_kwDORQTmyc4C-y7K";
const MAPPING = "pathname";
const LANG = "zh-CN";

export default function GiscusComment() {
	const [theme, setTheme] = useState("light");

	useEffect(() => {
		// 监听博客主题变化（假设你的博客在 <html> 或 <body> 上添加了 'dark' 类）
		const observer = new MutationObserver(() => {
			const isDark = document.documentElement.classList.contains("dark");
			setTheme(isDark ? "dark" : "light");
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		// 初始设置
		setTheme(
			document.documentElement.classList.contains("dark") ? "dark" : "light",
		);
		return () => observer.disconnect();
	}, []);

	return (
		<div className="giscus-wrapper mt-10">
			<Giscus
				repo={REPO}
				repoId={REPO_ID}
				category={CATEGORY}
				categoryId={CATEGORY_ID}
				mapping={MAPPING}
				reactionsEnabled="1"
				emitMetadata="0"
				inputPosition="top"
				theme={theme}
				lang={LANG}
				loading="lazy"
			/>
		</div>
	);
}
