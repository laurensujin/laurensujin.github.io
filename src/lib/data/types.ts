import type { Database } from "@/lib/supabase/database.types";
import type { ContentStatus, MediaRef, ProjectContent } from "@/lib/content/schema";

type Tables = Database["public"]["Tables"];
export type ProjectRow = Tables["projects"]["Row"];
export type ProjectDraftRow = Tables["project_drafts"]["Row"];
export type MediaRow = Tables["media"]["Row"];
export type SiteSettingsRow = Tables["site_settings"]["Row"];
export type ProfileRow = Tables["profile"]["Row"];
export type EducationRow = Tables["education"]["Row"];
export type SocialLinkRow = Tables["social_links"]["Row"];
export type PhotographySetRow = Tables["photography_sets"]["Row"];
export type ResumeFileRow = Tables["resume_files"]["Row"];

export type SocialLinkKind = "linkedin" | "instagram" | "email" | "github" | "website" | "other";

/** Site-wide copy and SEO settings, with media references parsed. */
export interface SiteSettings {
  siteName: string;
  heroHeadline: string;
  heroDescription: string;
  heroLocation: string;
  heroCtaLabel: string;
  selectedWorkLabel: string;
  photographyLabel: string;
  photographySubtitle: string;
  photographyDescription: string;
  footerLocation: string;
  footerCopyright: string;
  footerCredit: string;
  contactEmail: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaRef | null;
  favicon: MediaRef | null;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  about: string;
  image: MediaRef | null;
}

export interface Education {
  id: string;
  school: string;
  college: string;
  degree: string;
  major: string;
  graduation: string;
  sortOrder: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  kind: SocialLinkKind;
  showInProfile: boolean;
  showInFooter: boolean;
  sortOrder: number;
}

export interface ResumeFile {
  id: string;
  path: string;
  filename: string;
  sizeBytes: number;
  isActive: boolean;
  createdAt: string;
}

/** Everything the profile drawer and footer need. */
export interface ProfileData {
  profile: Profile;
  education: Education[];
  links: SocialLink[];
  resume: ResumeFile | null;
}

/** A published project as shown on the public site. */
export interface PublicProject {
  id: string;
  slug: string;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  content: ProjectContent;
}

/** A project as seen in the admin, with both live and draft content. */
export interface AdminProject {
  id: string;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  live: ProjectContent;
  draft: ProjectContent;
  draftUpdatedAt: string | null;
  /** True when the draft was saved after the last publish. */
  hasUnpublishedChanges: boolean;
}

export interface PhotographySet {
  id: string;
  title: string;
  caption: string;
  before: MediaRef | null;
  after: MediaRef | null;
  photographerCredit: string;
  retouchingCredit: string;
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  path: string;
  kind: "image" | "video" | "pdf";
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  title: string;
  altText: string;
  originalFilename: string | null;
  createdAt: string;
}
