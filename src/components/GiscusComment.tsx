// src/components/GiscusComment.tsx
import React from 'react';
import Giscus from '@giscus/react';

const REPO = 'Zionyas-Van/Zionyas-Van.github.io';
const REPO_ID = 'R_kgDORQTmyQ';
const CATEGORY = 'Announcements';
const CATEGORY_ID = 'DIC_kwDORQTmyc4C-y7K';
const MAPPING = 'pathname';
const THEME = 'preferred_color_scheme';
const LANG = 'zh-CN';

export default function GiscusComment() {
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
        theme={THEME}
        lang={LANG}
        loading="lazy"
      />
    </div>
  );
}