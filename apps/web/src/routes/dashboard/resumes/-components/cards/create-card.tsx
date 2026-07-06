import { t } from "@lingui/core/macro";
import { PlusIcon } from "@phosphor-icons/react";
import { useDialogStore } from "@/dialogs/store";
import { BaseCard } from "./base-card";

type CreateResumeCardProps = {
	onCreate?: () => void;
};

export function CreateResumeCard({ onCreate }: CreateResumeCardProps) {
	const { openDialog } = useDialogStore();

	return (
		<BaseCard
			title={t`Create a new resume`}
			description={t`Start building your resume from scratch`}
			onClick={() => (onCreate ? onCreate() : openDialog("resume.create", undefined))}
		>
			<div className="absolute inset-0 flex items-center justify-center">
				<PlusIcon weight="thin" className="size-12" />
			</div>
		</BaseCard>
	);
}
