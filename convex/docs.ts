import { query } from "./_generated/server";

const DEFAULT_START_AT = "2026-05-10T00:00:00+06:00";
const DEFAULT_END_AT = "2027-05-10T23:59:59+06:00";
const MAX_COUNT_SAMPLE = 1000;
const DEFAULT_TEAM = {
	name: "Narrative Guard Team",
	members: [
		{
			fullName: "Samonwita Sarker",
			role: "Frontend Developer",
			email: "sarker.samonwita@gmail.com",
			imageUrl: "/team/sam.jpeg",
		},
		{
			fullName: "Pratik Dev",
			role: "Full Stack Developer",
			email: "pratikdevofficial1@gmail.com",
			imageUrl: "/team/pratik.jpeg",
		},
		{
			fullName: "Dipika Nath",
			role: "Researcher",
			email: "arniedebnath@gmail.com",
			imageUrl: "/team/dipika.jpeg",
		},
	],
};

function parseTime(value: string | undefined, fallback: string) {
	const parsed = Date.parse(value || fallback);

	if (Number.isNaN(parsed)) {
		return Date.parse(fallback);
	}

	return parsed;
}

function getDocsAvailability(now: number) {
	const visibility = (process.env.DOCS_PUBLIC_VISIBILITY || "schedule")
		.trim()
		.toLowerCase();
	const startAt = parseTime(process.env.DOCS_PUBLIC_START_AT, DEFAULT_START_AT);
	const durationHours = Number(process.env.DOCS_PUBLIC_DURATION_HOURS);
	const endAt =
		Number.isFinite(durationHours) && durationHours > 0
			? startAt + durationHours * 60 * 60 * 1000
			: parseTime(process.env.DOCS_PUBLIC_END_AT, DEFAULT_END_AT);

	if (visibility === "on") {
		return {
			isAvailable: true,
			mode: "on" as const,
			startAt,
			endAt,
		};
	}

	if (visibility === "off") {
		return {
			isAvailable: false,
			mode: "off" as const,
			startAt,
			endAt,
		};
	}

	return {
		isAvailable: now >= startAt && now <= endAt,
		mode: "schedule" as const,
		startAt,
		endAt,
	};
}

function getDocsTeam() {
	const rawTeam = process.env.DOCS_TEAM_JSON;
	if (!rawTeam) return DEFAULT_TEAM;

	try {
		const parsed = JSON.parse(rawTeam) as {
			name?: unknown;
			members?: unknown;
		};
		const members = Array.isArray(parsed.members)
			? parsed.members
				.map((member) => {
					if (!member || typeof member !== "object") return null;

					const candidate = member as Record<string, unknown>;
					return {
						fullName:
							typeof candidate.fullName === "string"
								? candidate.fullName
								: "Team Member",
						role:
							typeof candidate.role === "string"
								? candidate.role
								: "Contributor",
						email:
							typeof candidate.email === "string"
								? candidate.email
								: "team@example.com",
						imageUrl:
							typeof candidate.imageUrl === "string"
								? candidate.imageUrl
								: "",
					};
				})
				.filter((member) => member !== null)
			: DEFAULT_TEAM.members;

		return {
			name: typeof parsed.name === "string" ? parsed.name : DEFAULT_TEAM.name,
			members: members.length ? members : DEFAULT_TEAM.members,
		};
	} catch {
		return DEFAULT_TEAM;
	}
}

export const getPublicDocsState = query({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const availability = getDocsAvailability(now);

		if (!availability.isAvailable) {
			return {
				availability,
				team: getDocsTeam(),
				stats: null,
			};
		}

		const [
			users,
			workspaces,
			members,
			invites,
			brands,
			reports,
			findings,
		] = await Promise.all([
			ctx.db.query("users").take(MAX_COUNT_SAMPLE),
			ctx.db.query("workspaces").take(MAX_COUNT_SAMPLE),
			ctx.db.query("workspaceMembers").take(MAX_COUNT_SAMPLE),
			ctx.db.query("workspaceInvites").take(MAX_COUNT_SAMPLE),
			ctx.db.query("brands").take(MAX_COUNT_SAMPLE),
			ctx.db.query("auditReports").take(MAX_COUNT_SAMPLE),
			ctx.db.query("auditFindings").take(MAX_COUNT_SAMPLE),
		]);

		const completedReports = reports.filter(
			(report) => report.status === "complete",
		);
		const averageScore = completedReports.length
			? Math.round(
				completedReports.reduce((total, report) => total + report.score, 0) /
				completedReports.length,
			)
			: 0;

		return {
			availability,
			team: getDocsTeam(),
			stats: {
				users: users.length,
				workspaces: workspaces.length,
				activeMembers: members.filter((member) => member.status === "active")
					.length,
				pendingInvites: invites.filter((invite) => invite.status === "pending")
					.length,
				brands: brands.length,
				reports: reports.length,
				completedReports: completedReports.length,
				findings: findings.length,
				averageScore,
				onBrandReports: completedReports.filter(
					(report) => report.verdict === "on_brand",
				).length,
				needsReviewReports: completedReports.filter(
					(report) => report.verdict === "needs_review",
				).length,
				offBrandReports: completedReports.filter(
					(report) => report.verdict === "off_brand",
				).length,
				sampleLimit: MAX_COUNT_SAMPLE,
			},
		};
	},
});
