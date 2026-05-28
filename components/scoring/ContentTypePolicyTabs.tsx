import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	CONTENT_TYPE_SCORING_GUIDE,
	formatWeightPercent,
	getStrictnessLabel,
	ISSUE_TYPE_LABELS,
	SCORE_CAP_LABELS,
	SCORE_DIMENSION_GUIDE,
	SCORING_GUIDE_CONTENT_TYPES,
	SCORING_GUIDE_ISSUE_TYPES,
	SCORING_GUIDE_SCORE_CAPS,
} from "@/lib/audit-scoring-guide";
import { SCORE_DIMENSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ContentTypePolicyTabs() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Content Type Policy</CardTitle>
				<CardDescription>
					Each content type uses the same scoring ingredients, but changes how
					much each part matters.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="generic">
					<TabsList>
						{SCORING_GUIDE_CONTENT_TYPES.map((contentType) => (
							<TabsTrigger
								key={contentType}
								value={contentType}
								className="px-3"
							>
								{CONTENT_TYPE_SCORING_GUIDE[contentType].label}
							</TabsTrigger>
						))}
					</TabsList>

					{SCORING_GUIDE_CONTENT_TYPES.map((contentType) => {
						const policy = CONTENT_TYPE_SCORING_GUIDE[contentType];
						const highestWeight = Math.max(
							...Object.values(policy.scoringWeights),
						);

						return (
							<TabsContent
								key={contentType}
								value={contentType}
								className="mt-0"
							>
								<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
									<div className="flex flex-col gap-6">
										<section className="flex flex-col gap-3">
											<div>
												<h3 className="text-base font-medium">
													What This Content Type Cares About
												</h3>
												<p className="mt-2 text-sm leading-6 text-muted-foreground">
													{policy.auditInstructions}
												</p>
											</div>
										</section>

										<section className="flex flex-col gap-3">
											<div>
												<h3 className="text-base font-medium">
													Dimension Weights
												</h3>
												<p className="mt-1 text-sm text-muted-foreground">
													Higher percentages have more influence on the weighted
													dimension score.
												</p>
											</div>
											<div className="grid gap-3">
												{SCORE_DIMENSIONS.map((dimension) => {
													const weight = policy.scoringWeights[dimension];
													const percent = Math.round(weight * 100);
													const isHighest = weight === highestWeight;

													return (
														<div
															key={dimension}
															className={cn(
																"rounded-lg border bg-background p-3",
																isHighest && "border-primary bg-primary/10",
															)}
														>
															<div className="flex flex-wrap items-start justify-between gap-2">
																<div className="min-w-0">
																	<div className="flex flex-wrap items-center gap-2">
																		<span className="font-medium">
																			{SCORE_DIMENSION_GUIDE.labels[dimension]}
																		</span>
																		{isHighest ? (
																			<Badge variant="secondary">
																				Highest weight
																			</Badge>
																		) : null}
																	</div>
																	<p className="mt-1 text-sm leading-5 text-muted-foreground">
																		{
																			SCORE_DIMENSION_GUIDE.descriptions[
																				dimension
																			]
																		}
																	</p>
																</div>
																<span className="font-semibold tabular-nums">
																	{formatWeightPercent(weight)}
																</span>
															</div>
															<Progress
																value={percent}
																className="mt-3 h-2"
															/>
														</div>
													);
												})}
											</div>
										</section>
									</div>

									<div className="flex flex-col gap-6">
										<section className="flex flex-col gap-3">
											<div>
												<h3 className="text-base font-medium">
													Issue Strictness
												</h3>
												<p className="mt-1 text-sm text-muted-foreground">
													Multipliers adjust the base penalty for this content
													type.
												</p>
											</div>
											<div className="grid gap-2">
												{SCORING_GUIDE_ISSUE_TYPES.map((issueType) => {
													const multiplier =
														policy.penaltyMultipliers[issueType];

													return (
														<div
															key={issueType}
															className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3"
														>
															<span className="font-medium">
																{ISSUE_TYPE_LABELS[issueType]}
															</span>
															<div className="flex items-center gap-2">
																<Badge variant="outline">
																	{getStrictnessLabel(multiplier)}
																</Badge>
																<span className="text-sm tabular-nums text-muted-foreground">
																	{multiplier}x
																</span>
															</div>
														</div>
													);
												})}
											</div>
										</section>

										<section className="flex flex-col gap-3">
											<div>
												<h3 className="text-base font-medium">Score Caps</h3>
												<p className="mt-1 text-sm leading-6 text-muted-foreground">
													Caps prevent risky content from receiving a high score
													even when other parts look good.
												</p>
											</div>
											<div className="grid gap-2">
												{SCORING_GUIDE_SCORE_CAPS.map((capKey) => (
													<div
														key={capKey}
														className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3"
													>
														<span className="font-medium">
															{SCORE_CAP_LABELS[capKey]}
														</span>
														<span className="text-sm tabular-nums text-muted-foreground">
															Max {policy.scoreCaps[capKey]}
														</span>
													</div>
												))}
											</div>
										</section>
									</div>
								</div>
							</TabsContent>
						);
					})}
				</Tabs>
			</CardContent>
		</Card>
	);
}
