import { photos, type Photo } from "./photos";

export interface Project {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  /** short editorial standfirst shown in indexes */
  standfirst: string;
  /** longer story for the case study page */
  story: string;
  client: string;
  technical: string;
  hero: Photo;
  /** sequenced frames with narrative beats */
  sequence: { photo: Photo; beat: string }[];
}

export const projects: Project[] = [
  {
    slug: "hvb-weddings-signature",
    title: "HVB Weddings Signature",
    category: "Weddings",
    location: "Tunis",
    year: "2026",
    standfirst: "A wedding treated like cinema — from the glasshouse to the golden car.",
    story:
      "A wedding story built the way the day actually feels: quiet anticipation in the glasshouse, the weight of detail, portraits that stay human, and a closing frame elegant enough to outlive the trends it was shot in.",
    client: "Private wedding commission",
    technical:
      "Natural light, editorial direction, black-and-white sequence, refined colour grade.",
    hero: photos.goldenCarIntimate,
    sequence: [
      { photo: photos.bridalReflection, beat: "Preparation" },
      { photo: photos.bridalBouquet, beat: "Detail" },
      { photo: photos.couplePortrait, beat: "Portraits" },
      { photo: photos.celebrationLift, beat: "Celebration" },
      { photo: photos.goldenCarArchitecture, beat: "Scale" },
      { photo: photos.goldenCarIntimate, beat: "The closing frame" },
    ],
  },
  {
    slug: "elissa-live-stage",
    title: "Elissa, Live",
    category: "Events",
    location: "Live Arena",
    year: "2026",
    standfirst: "Arena scale, stage architecture and a performer under light.",
    story:
      "A live performance sequence built around scale: the architecture of the stage, the energy of the crowd, and the controlled intimacy of a single performer under light. Shot fast, in low light, with cinematic colour restraint.",
    client: "Event production",
    technical:
      "Low-light coverage, stage atmosphere, fast movement, cinematic colour restraint.",
    hero: photos.elissaStageCommand,
    sequence: [
      { photo: photos.elissaBackstage, beat: "Before the lights" },
      { photo: photos.elissaStageArrival, beat: "The arrival" },
      { photo: photos.elissaStageCommand, beat: "Command" },
      { photo: photos.elissaSpotlight, beat: "Under the spotlight" },
    ],
  },
  {
    slug: "studio-portrait-direction",
    title: "Studio Portrait Direction",
    category: "Portraits",
    location: "HVB Studio",
    year: "2026",
    standfirst: "Posture, gaze and silence in a controlled room.",
    story:
      "A controlled studio session built around posture, gaze and silence — a visual identity that feels immediate without becoming overproduced. Minimal set, deliberate light, retouching that keeps the person present.",
    client: "Portrait commission",
    technical: "Controlled studio light, minimal set, premium retouching direction.",
    hero: photos.whiteCoatPortrait,
    sequence: [
      { photo: photos.whiteCoatPortrait, beat: "The directed gaze" },
      { photo: photos.profileStudy, beat: "Profile study" },
      { photo: photos.furPortrait, beat: "Polish" },
    ],
  },
  {
    slug: "brand-visual-campaign",
    title: "Brand Visual Campaign",
    category: "Commercial",
    location: "HVB Studio",
    year: "2026",
    standfirst: "A product story strong enough to carry a campaign.",
    story:
      "A brand production shaped by clean composition and strong visual hierarchy — one idea, pushed until it holds campaign, social and editorial surfaces on its own.",
    client: "Commercial client",
    technical: "Creative direction, production planning, commercial image delivery.",
    hero: photos.denimEditorial,
    sequence: [{ photo: photos.denimEditorial, beat: "The concept" }],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
