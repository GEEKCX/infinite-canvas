// 姿势复刻 prompt 组装：姿势线稿阶段复用分镜的 buildStoryboardPoseSketchPrompt，这里只负责最终单张生成的 prompt
export type PoseReplicateParams = {
    styleRecipe: string; // 可为空字符串
    description: string; // 可为空字符串
};

export function buildPoseReplicatePrompt({ styleRecipe, description }: PoseReplicateParams): string {
    return [
        "图 1 为动作参考线稿。只参考其中的人物动作、空间位置、接触点、重心与物理受力关系；不要复制线稿的线稿风格，不要把画面变成黑白线稿。",
        styleRecipe ? `人物与画风以风格配方为准（必须严格遵循）：${styleRecipe}` : "人物与画风以本提示词为准，请自行补全人物外貌与服装细节。",
        description ? `画面要求：${description}` : "保持与线稿相同的构图、景别与镜头，完整复刻姿势。",
    ].join("\n\n");
}
