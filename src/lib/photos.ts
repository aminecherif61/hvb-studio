export type PhotoTier = "hero" | "feature" | "support";
export type PhotoCategory = "Weddings" | "Portraits" | "Events" | "Commercial";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  category: PhotoCategory;
  /** hero — fullscreen moments; feature — large editorial; support — story glue */
  tier: PhotoTier;
  title: string;
  location: string;
  /** one-line caption used in storytelling sequences */
  caption?: string;
}

export const photos: Record<string, Photo> = {
  goldenCarIntimate: {
    id: "goldenCarIntimate",
    src: "/images/hamdi/weddings/wedding-golden-car-intimate.jpg",
    alt: "Bride and groom in a quiet embrace against a gold vintage convertible, framed by grand hotel columns",
    width: 1080,
    height: 1440,
    category: "Weddings",
    tier: "hero",
    title: "Golden Hour, Standing Still",
    location: "Tunis",
    caption: "The moment nobody staged.",
  },
  goldenCarArchitecture: {
    id: "goldenCarArchitecture",
    src: "/images/hamdi/weddings/wedding-golden-car-architecture.jpg",
    alt: "Couple beside a gold vintage convertible beneath monumental stone architecture",
    width: 1080,
    height: 1440,
    category: "Weddings",
    tier: "hero",
    title: "Architecture and Forever",
    location: "Tunis",
    caption: "Scale belongs to the couple, not the building.",
  },
  bridalReflection: {
    id: "bridalReflection",
    src: "/images/hamdi/weddings/gammarth-bridal-reflection.jpg",
    alt: "Bride seated by a reflecting pool inside a glasshouse, veil falling over her shoulder",
    width: 1080,
    height: 1440,
    category: "Weddings",
    tier: "feature",
    title: "The Glasshouse",
    location: "Mövenpick Gammarth",
    caption: "Preparation, before the day begins to move.",
  },
  bridalBouquet: {
    id: "bridalBouquet",
    src: "/images/hamdi/weddings/gammarth-bridal-bouquet.jpg",
    alt: "Bridal bouquet of white roses and lilies held against an embellished gown",
    width: 1080,
    height: 1440,
    category: "Weddings",
    tier: "support",
    title: "Bouquet and Veil",
    location: "Mövenpick Gammarth",
    caption: "The details carry the memory.",
  },
  celebrationLift: {
    id: "celebrationLift",
    src: "/images/hamdi/weddings/gammarth-celebration-lift.jpg",
    alt: "Groom lifting the bride over his shoulder on a garden path, bouquet raised in celebration",
    width: 1080,
    height: 1403,
    category: "Weddings",
    tier: "support",
    title: "The Lift",
    location: "Mövenpick Gammarth",
    caption: "Grand when the moment asks for it.",
  },
  couplePortrait: {
    id: "couplePortrait",
    src: "/images/hamdi/weddings/gammarth-couple-portrait.jpg",
    alt: "Bride and groom framed by dark glass panels reflecting palms and sea light",
    width: 1080,
    height: 1440,
    category: "Weddings",
    tier: "feature",
    title: "Glass and Sea Light",
    location: "Mövenpick Gammarth",
    caption: "Portraits, without the portrait stiffness.",
  },
  elissaStageCommand: {
    id: "elissaStageCommand",
    src: "/images/hamdi/events/elissa-stage-command.jpg",
    alt: "Elissa commanding an arena stage beneath a circular screen, arm raised to the crowd",
    width: 1080,
    height: 1439,
    category: "Events",
    tier: "hero",
    title: "Stage Command",
    location: "Live Arena",
    caption: "One performer. Ten thousand people. One frame.",
  },
  elissaStageArrival: {
    id: "elissaStageArrival",
    src: "/images/hamdi/events/elissa-stage-arrival.jpg",
    alt: "Elissa arriving on stage through light and haze",
    width: 1080,
    height: 1439,
    category: "Events",
    tier: "feature",
    title: "The Arrival",
    location: "Live Arena",
    caption: "The second before the first note.",
  },
  elissaSpotlight: {
    id: "elissaSpotlight",
    src: "/images/hamdi/events/elissa-spotlight-close.jpg",
    alt: "Close portrait of Elissa under a single spotlight",
    width: 1080,
    height: 1439,
    category: "Events",
    tier: "support",
    title: "Under the Spotlight",
    location: "Live Arena",
    caption: "Intimacy at arena scale.",
  },
  elissaBackstage: {
    id: "elissaBackstage",
    src: "/images/hamdi/events/elissa-backstage-portrait.jpg",
    alt: "Backstage portrait of Elissa before the lights",
    width: 1080,
    height: 1439,
    category: "Events",
    tier: "support",
    title: "Before the Lights",
    location: "Backstage",
    caption: "The quiet side of the spectacle.",
  },
  whiteCoatPortrait: {
    id: "whiteCoatPortrait",
    src: "/images/hamdi/portraits/fadhel-white-coat-portrait.jpg",
    alt: "Studio portrait of a man in a white leather jacket over black, direct gaze into camera",
    width: 1080,
    height: 1440,
    category: "Portraits",
    tier: "hero",
    title: "White on Black",
    location: "HVB Studio",
    caption: "Direction you can feel in the gaze.",
  },
  profileStudy: {
    id: "profileStudy",
    src: "/images/hamdi/portraits/fadhel-profile-study.jpg",
    alt: "Studio profile study with controlled shadow",
    width: 1080,
    height: 1440,
    category: "Portraits",
    tier: "support",
    title: "Profile Study",
    location: "HVB Studio",
    caption: "Posture, silence, light.",
  },
  furPortrait: {
    id: "furPortrait",
    src: "/images/hamdi/portraits/editorial-fur-portrait.jpg",
    alt: "Editorial portrait with fur texture and polished retouching",
    width: 1080,
    height: 1440,
    category: "Portraits",
    tier: "support",
    title: "Editorial Fur",
    location: "HVB Studio",
    caption: "Polish without losing the person.",
  },
  denimEditorial: {
    id: "denimEditorial",
    src: "/images/hamdi/studio/denim-editorial-studio.jpg",
    alt: "Model seated on a sculptural mountain of denim in a white studio",
    width: 1080,
    height: 1350,
    category: "Commercial",
    tier: "feature",
    title: "Denim, as Landscape",
    location: "HVB Studio",
    caption: "A product story with a point of view.",
  },
};

export const allPhotos: Photo[] = Object.values(photos);

export const byCategory = (category: PhotoCategory) =>
  allPhotos.filter((p) => p.category === category);
