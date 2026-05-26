"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

type CopyButtonProps = {
	content: string;
	className?: string;
	copiedDurationMs?: number;
	label?: string;
};

export function CopyButton({
	content,
	className,
	copiedDurationMs = 2000,
	label = "Copy to clipboard",
}: CopyButtonProps) {
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		if (!isCopied) return;

		const timeoutId = window.setTimeout(() => {
			setIsCopied(false);
		}, copiedDurationMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [copiedDurationMs, isCopied]);

	async function handleCopy() {
		await navigator.clipboard.writeText(content);
		setIsCopied(true);
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="icon-sm"
			aria-label={isCopied ? "Copied" : label}
			onClick={handleCopy}
			className={className}
		>
			<span className="relative grid size-4 place-items-center">
				<CopyIcon
					data-icon="inline-start"
					className={cn(
						"absolute transition-all duration-200",
						isCopied ? "scale-75 opacity-0" : "scale-100 opacity-100",
					)}
				/>
				<CheckIcon
					data-icon="inline-start"
					className={cn(
						"absolute text-success transition-all duration-200",
						isCopied ? "scale-100 opacity-100" : "scale-75 opacity-0",
					)}
				/>
			</span>
		</Button>
	);
}
