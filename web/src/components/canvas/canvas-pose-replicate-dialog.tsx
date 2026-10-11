import { useEffect, useState } from "react";
import { Button, Input, Modal } from "antd";
import { PersonStanding } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PoseReplicateParams } from "@/lib/pose-replicate-prompts";

export function CanvasPoseReplicateDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (params: PoseReplicateParams) => void }) {
    const { t } = useTranslation();
    const [description, setDescription] = useState("");
    const [styleRecipe, setStyleRecipe] = useState("");

    useEffect(() => {
        if (open) {
            setDescription("");
            setStyleRecipe("");
        }
    }, [open]);

    const confirm = () => {
        onConfirm({ description: description.trim(), styleRecipe: styleRecipe.trim() });
    };

    return (
        <Modal title={t("canvas.poseReplicate.title")} open={open} onCancel={onClose} footer={null} width={560} centered destroyOnHidden>
            <div className="space-y-4 py-2">
                <div className="space-y-1">
                    <span className="text-sm font-medium opacity-75">{t("canvas.poseReplicate.description")}</span>
                    <Input.TextArea rows={3} value={description} placeholder={t("canvas.poseReplicate.descriptionPlaceholder")} onChange={(event) => setDescription(event.target.value)} />
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-medium opacity-75">{t("canvas.poseReplicate.styleRecipe")}</span>
                    <Input.TextArea rows={3} value={styleRecipe} placeholder={t("canvas.poseReplicate.styleRecipePlaceholder")} onChange={(event) => setStyleRecipe(event.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={onClose}>{t("common.cancel")}</Button>
                    <Button type="primary" icon={<PersonStanding className="size-4" />} onClick={confirm}>
                        {t("canvas.poseReplicate.generate")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
