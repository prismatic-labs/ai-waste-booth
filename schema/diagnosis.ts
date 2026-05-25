export type ArchetypeId =
  | "regeneration_goblin"
  | "context_hoarder"
  | "confident_hallucination_enjoyer"
  | "prompt_archaeologist"
  | "copy_paste_pilot"
  | "improviser";

export type PatternId =
  | "STALL-001"
  | "CACHE-001"
  | "RAG-001"
  | "BABBLE-001"
  | "ZOMBIE-001"
  | "CTX-001"
  | "EMPTY-001";

export type Diagnosis = {
  id: string;
  timestamp: string;
  isBuilder: boolean;
  useCase: string;
  // casual path (isBuilder = false)
  archetype?: ArchetypeId;
  symptoms?: string[];
  humanFix?: string[];
  verdict?: string;
  // builder path (isBuilder = true)
  appType?: string;
  concern?: string;
  suspectedPattern?: PatternId;
  risk?: string;
  secondaryRisk?: string;
  whatToCheck?: string[];
  // routing
  ctaType: "upgrade_15" | "book_teardown";
};
