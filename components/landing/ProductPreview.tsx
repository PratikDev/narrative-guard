import Image from "next/image";

export function ProductPreview({
	src,
	alt,
	priority = false,
}: {
	src: string;
	alt: string;
	priority?: boolean;
}) {
	return (
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<Image
				src={src}
				alt={alt}
				width={1440}
				height={1024}
				priority={priority}
				className="h-auto w-full"
				sizes="(min-width: 1024px) 56vw, 100vw"
			/>
		</div>
	);
}
