export interface MediaItem {
  id: string;
  url: string;
  title: string;
  caption: string;
  category: 'portrait' | 'pulpit' | 'community' | 'mosque' | 'academic';
  year?: string;
  tags: string[];
}

export interface TimelineMilestone {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  description: string;
  mediaUrl: string;
  mediaCaption: string;
  iconName: string;
  highlights: string[];
  year?: string;
  dateArabic?: string;
  imageUrl?: string;
  role?: string;
  tags?: string[];
  category?: string;
  keyAchievements?: string[];
  icon?: string;
  images?: string[]; // Multiple images rotating every 5 seconds with navigation controls
  order?: number;
  updatedAt?: string;
}

export interface AcademicCertificate {
  id: string;
  title: string;
  issuer?: string;
  institution?: string;
  country?: string;
  year: string;
  dateStr?: string;
  recipient?: string;
  code?: string;
  imageUrl: string;
  description: string;
  type?: 'academic' | 'reference';
  category: 'doctorate' | 'master' | 'honorary' | 'practitioner' | 'award' | 'reference' | 'ijaza' | 'hawza' | string;
  verificationTags?: string[];
}

export interface BookPublication {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  author: string;
  publisher: string;
  edition?: string;
  year?: string;
  summary: string;
  keyTopics: string[];
  externalUrl?: string;
  // Compatibility & rich metadata fields
  coverImage?: string;
  description?: string;
  topics?: string[];
  pages?: number;
  downloadUrl?: string;
  price?: string;
  whatsappOrderUrl?: string;
}

export interface VideoArchive {
  id: string;
  youtubeId: string;
  title: string;
  category: 'speech' | 'mercy' | 'documentary' | 'prayer' | 'social';
  description: string;
  thumbnailUrl: string;
}

export interface TestimonialItem {
  id: string;
  speakerName: string;
  speakerTitle: string;
  association: string;
  quote: string;
  dateOrEvent?: string;
  // Source Documentation Fields
  sourceName?: string;
  sourceType?: 'youtube' | 'memorial_ceremony' | 'documentary' | 'family_statement' | 'official_speech' | 'written';
  sourceUrl?: string;
  sourceContext?: string;
  verifiedBy?: string;
  // Optional compatibility/extra fields
  author?: string;
  role?: string;
  relationship?: string;
  location?: string;
  avatarUrl?: string;
}

export interface CommunitySubmission {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface SiteHeroSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

export interface QuoteItem {
  id: string;
  text: string;
  context: string;
}

export interface SiteHeroContent {
  badge: string;
  honorific: string;
  namePrefix: string;
  sheikhName: string;
  titleFontSize?: string;
  quotesFontSize?: string;
  bioIntro: string;
  exploreButtonText: string;
  videoButtonText: string;
  videoButtonYoutubeId: string;
  communityButtonText: string;
  slides: SiteHeroSlide[];
}

export interface SiteGeneralSettings {
  siteTitle: string;
  siteSubtitle: string;
  titleFontSize?: string;
  quotesFontSize?: string;
  sheikhHonorific: string;
  yearsOfLife: string;
  mosqueName: string;
  villageName: string;
  governorateName: string;
  footerBio: string;
  youtubeChannelUrl: string;
  instagramUrl: string;
}

export interface NavLabels {
  home: string;
  timeline: string;
  certificates: string;
  certificatesDropdown: string;
  academicCertificates: string;
  referenceCertificates: string;
  libraryDropdown: string;
  books: string;
  videos: string;
  gallery: string;
  testimonials: string;
  submissions: string;
}

export interface SiteContent {
  general: SiteGeneralSettings;
  navLabels?: NavLabels;
  hero: SiteHeroContent;
  quotes: QuoteItem[];
  impactMetrics: ImpactStat[];
  timeline: TimelineMilestone[];
  certificates: AcademicCertificate[];
  books: BookPublication[];
  videos: VideoArchive[];
  testimonials: TestimonialItem[];
  gallery: MediaItem[];
  updatedAt?: string;
}
