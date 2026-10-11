// 同系列分镜 prompt 组装：姿势两阶段（参考图先转线稿，线稿作为最终生成的唯一参考图）+ 系列一致性（锁人物与画风，仅按枚举维度变化镜头与场景）
export const STORYBOARD_DEFAULT_SHOT_COUNT = 4;
export const STORYBOARD_MIN_SHOTS = 2;
export const STORYBOARD_MAX_SHOTS = 8;

export type StoryboardParams = {
    shotCount: number;
    shotDescriptions: string[]; // 与 shotCount 对应，可含空串
    keepPose: boolean;
    styleRecipe: string; // 可为空字符串
};

export type StoryboardShot = {
    index: number; // 1 起
    description: string; // 该镜最终画面描述（含自动分配结果）
    prompt: string; // 该镜最终完整 prompt，可直接传给 requestEdit
};

// 留空镜头按此枚举顺序自动分配变化维度：固定枚举比让模型自由发挥更可控，循环取用保证任意镜数都有覆盖
const VARIATION_TEMPLATES = [
    "拉远至全身景别，完整展示人物所处环境与空间关系",
    "切换至侧面机位，从另一角度呈现人物与场景",
    "面部特写镜头，聚焦人物表情与神态细节",
    "略微俯视的机位，强调场景的空间层次与地面细节",
    "过肩视角，从人物身后呈现其面对的场景",
    "略微仰视的机位，突出人物姿态与上方空间",
    "近景平视，强调光线、质感与氛围细节",
    "广角远景，人物位于画面一侧，强调整体环境氛围",
];

export function normalizeStoryboardShots(params: StoryboardParams): StoryboardShot[] {
    const shotCount = Math.min(STORYBOARD_MAX_SHOTS, Math.max(STORYBOARD_MIN_SHOTS, params.shotCount));
    const styleRecipe = params.styleRecipe.trim();
    let templateIndex = 0;
    return Array.from({ length: shotCount }, (_, i): StoryboardShot => {
        const description = (params.shotDescriptions[i] ?? "").trim() || VARIATION_TEMPLATES[templateIndex++ % VARIATION_TEMPLATES.length];
        return { index: i + 1, description, prompt: buildShotPrompt(description, params.keepPose, styleRecipe) };
    });
}

// keepPose 时最终请求只带姿势线稿、不带原图：线稿只承担姿势职责，避免模型从原图复制画风，人物与画风改由风格配方或提示词提供
function buildShotPrompt(description: string, keepPose: boolean, styleRecipe: string) {
    const lines = keepPose
        ? [
              "图 1 为动作参考线稿。只参考其中的人物动作、空间位置、接触点、重心与物理受力关系；不要复制线稿的线稿风格，不要把画面变成黑白线稿。",
              styleRecipe ? `人物与画风以风格配方为准（必须严格遵循）：${styleRecipe}` : "人物与画风以本提示词为准，请自行补全人物外貌与服装细节。",
              `本镜分镜要求：${description}`,
              "除分镜要求外，各镜之间保持同一人物、同一服装与同一画风。",
          ]
        : [
              "图 1 为人物与画风基准，严格保持图 1 中人物的外貌、发型、体型、服装与整体画风。",
              styleRecipe ? `风格配方（必须严格遵循）：${styleRecipe}` : "",
              `本镜分镜要求：${description}`,
              "只按分镜要求改变镜头与场景，不要改变人物设定与画风。",
          ];
    return lines.filter(Boolean).join("\n\n");
}

// 阶段一 prompt：该阶段参考图即原图，产出的干净线稿将作为最终生成的唯一参考图
export function buildStoryboardPoseSketchPrompt(): string {
    return `本图将作为后续同系列分镜的姿势参考。将上传图片转换为干净的黑白漫画轮廓线稿，纯白背景。严格保持原图的人物姿态、构图、比例、肢体方向、遮挡关系、身体接触点和坐姿受力关系。画面风格参考：成稿型二维人物轮廓线稿，线条干净、细黑线、自然连续，有少量必要的内轮廓线来表达身体转折和衣物边界。不要画成教学结构图。不要骨架线、火柴人、圆柱体、球形关节、十字辅助线、透视辅助线、箭头、文字标注、重心线、受力箭头、网格、草稿线。不要五官、眼睛、鼻子、嘴巴；头发只保留大轮廓和主要发束，不画复杂发丝细节。不要阴影、灰度、填色、纹理、背景物细节。最终效果应像一张干净的漫画人物描边线稿，而不是人体姿势分析图。`;
}
