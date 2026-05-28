import { AcceptInvitePageClient } from "@/components/team/AcceptInvitePageClient";

export default async function InvitePage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;

	return <AcceptInvitePageClient token={token} />;
}
