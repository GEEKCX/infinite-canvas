import { useEffect, useState } from "react";
import { Button, Input, InputNumber, Modal, Switch } from "antd";
import { Film } from "lucide-react";
import { useTranslation } from "react-i18next";

import { STORYBOARD_DEFAULT_SHOT_COUNT, STORYBOARD_MAX_SHOTS, STORYBOARD_MIN_SHOTS, type StoryboardParams } from "@/lib/storyboard-prompts";

export function CanvasStoryboardDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (params: StoryboardParams) => void }) {
    const { t } = useTranslation();
    const [shotCount, setShotCount] = useState(STORYBOARD_DEFAULT_SHOT_COUNT);
    const [descriptionsText, setDescriptionsText] = useState("");
    const [styleRecipe, setStyleRecipe] = useState("");
    const [keepPose, setKeepPose] = useState(false);

    useEffect(() => {
        if (open) {
            setShotCount(STORYBOARD_DEFAULT_SHOT_COUNT);
            setDescriptionsText("");
            setStyleRecipe("");
            setKeepPose(false);
        }
    }, [open]);

    const confirm = () => {
        // 每行一镜；不足的镜位留空，交给变化维度自动分配
        const lines = descriptionsText.split("\n").map((line) => line.trim());
        const shotDescriptions = Array.from({ length: shotCount }, (_, index) => lines[index] ?? "");
        onConfirm({ shotCount, shotDescriptions, keepPose, styleRecipe: styleRecipe.trim() });
    };

    return (
        <Modal title={t("canvas.storyboard.title")} open={open} onCancel={onClose} footer={null} width={560} centered destroyOnHidden>
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-[96px_1fr] items-center gap-4">
                    <span className="text-sm font-medium opacity-75">{t("canvas.storyboard.shotCount")}</span>
                    <InputNumber className="w-24" min={STORYBOARD_MIN_SHOTS} max={STORYBOARD_MAX_SHOTS} value={shotCount} onChange={(value) => setShotCount(value ?? STORYBOARD_DEFAULT_SHOT_COUNT)} />
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium opacity-75">{t("canvas.storyboard.shotDescriptions")}</span>
                    <Input.TextArea rows={6} value={descriptionsText} placeholder={t("canvas.storyboard.shotDescriptionsPlaceholder")} onChange={(event) => setDescriptionsText(event.target.value)} />
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium opacity-75">{t("canvas.storyboard.styleRecipe")}</span>
                    <Input.TextArea rows={3} value={styleRecipe} placeholder={t("canvas.storyboard.styleRecipePlaceholder")} onChange={(event) => setStyleRecipe(event.target.value)} />
                </div>
                <div className="grid grid-cols-[96px_1fr] items-center gap-4">
                    <span className="text-sm font-medium opacity-75">{t("canvas.storyboard.keepPose")}</span>
                    <div className="flex items-center gap-2">
                        <Switch size="small" checked={keepPose} onChange={setKeepPose} />
                        <span className="text-xs opacity-50">{t("canvas.storyboard.keepPoseHint")}</span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={onClose}>{t("common.cancel")}</Button>
                    <Button type="primary" icon={<Film className="size-4" />} onClick={confirm}>
                        {t("canvas.storyboard.generate")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
