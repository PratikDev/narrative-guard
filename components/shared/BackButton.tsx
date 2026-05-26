"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

type BackButtonProps = {
	content?: string;
	href?: ComponentProps<typeof Link>["href"];
};
export default function BackButton({ content, href }: BackButtonProps) {
	const router = useRouter();

	if (href) {
		return (
			<Link
				href={href}
				className={buttonVariants({ variant: "outline" })}
			>
				<ArrowLeft className="size-4" />
				{content || "Go Back"}
			</Link>
		);
	}

	return (
		<Button
			type="button"
			variant="outline"
			onClick={() => router.back()}
		>
			<ArrowLeft className="size-4" />
			{content || "Go Back"}
		</Button>
	);
}
