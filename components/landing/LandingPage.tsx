import { AuditTypesSection } from "@/components/landing/AuditTypesSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ReportOutputSection } from "@/components/landing/ReportOutputSection";
import { ScoringTransparencySection } from "@/components/landing/ScoringTransparencySection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";

export function LandingPage() {
	return (
		<main className="min-h-svh bg-background">
			<LandingHeader />
			<HeroSection />
			<WorkflowSection />
			<AuditTypesSection />
			<ReportOutputSection />
			<ScoringTransparencySection />
			<UseCasesSection />
			<FinalCtaSection />
		</main>
	);
}
