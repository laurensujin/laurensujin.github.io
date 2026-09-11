import { parseMediaRef, parseProjectContent, type ContentStatus, type MediaRef } from "@/lib/content/schema";
import type {
  AdminProject,
  Education,
  EducationRow,
  MediaItem,
  MediaRow,
  PhotographySet,
  PhotographySetRow,
  Profile,
  ProfileRow,
  ProjectDraftRow,
  ProjectRow,
  PublicProject,
  ResumeFile,
  ResumeFileRow,
  SiteSettings,
  SiteSettingsRow,
  SocialLink,
  SocialLinkRow,
} from "./types";

/** Converts database rows (snake_case, raw JSON) into app objects. */

export function toStatus(value: string): ContentStatus {
  return value === "published" || value === "hidden" ? value : "draft";
}

export function toSiteSettings(row: SiteSettingsRow | null): SiteSettings {
  return {
    siteName: row?.site_name ?? "Sujin Lee",
    heroHeadline: row?.hero_headline ?? "",
    heroDescription: row?.hero_description ?? "",
    heroLocation: row?.hero_location ?? "",
    heroCtaLabel: row?.hero_cta_label ?? "Selected Work",
    selectedWorkLabel: row?.selected_work_label ?? "Selected Work",
    photographyLabel: row?.photography_label ?? "Portrait",
    photographySubtitle: row?.photography_subtitle ?? "",
    photographyDescription: row?.photography_description ?? "",
    footerLocation: row?.footer_location ?? "",
    footerCopyright: row?.footer_copyright ?? "",
    footerCredit: row?.footer_credit ?? "",
    contactEmail: row?.contact_email ?? "",
    seoTitle: row?.seo_title ?? "",
    seoDescription: row?.seo_description ?? "",
    ogImage: parseMediaRef(row?.og_image),
    favicon: parseMediaRef(row?.favicon),
  };
}

export function toProfile(row: ProfileRow | null): Profile {
  return {
    name: row?.name ?? "",
    title: row?.title ?? "",
    location: row?.location ?? "",
    about: row?.about ?? "",
    image: parseMediaRef(row?.image),
  };
}

export function toEducation(row: EducationRow): Education {
  return {
    id: row.id,
    school: row.school,
    college: row.college,
    degree: row.degree,
    major: row.major,
    graduation: row.graduation,
    sortOrder: row.sort_order,
  };
}

export function toSocialLink(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    kind: row.kind as SocialLink["kind"],
    showInProfile: row.show_in_profile,
    showInFooter: row.show_in_footer,
    sortOrder: row.sort_order,
  };
}

export function toResumeFile(row: ResumeFileRow): ResumeFile {
  return {
    id: row.id,
    path: row.path,
    filename: row.filename,
    sizeBytes: Number(row.size_bytes),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function toPublicProject(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    slug: row.slug,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    content: parseProjectContent(row.content),
  };
}

type DraftJoin = Pick<ProjectDraftRow, "content" | "updated_at"> | Pick<ProjectDraftRow, "content" | "updated_at">[] | null;

export function toAdminProject(row: ProjectRow & { project_drafts?: DraftJoin }): AdminProject {
  const joined = row.project_drafts;
  const draftRow = Array.isArray(joined) ? (joined[0] ?? null) : (joined ?? null);
  const live = parseProjectContent(row.content);
  const draft = draftRow ? parseProjectContent(draftRow.content) : live;
  const draftUpdatedAt = draftRow?.updated_at ?? null;
  const hasUnpublishedChanges =
    row.status !== "published" ||
    !row.published_at ||
    (draftUpdatedAt !== null && new Date(draftUpdatedAt).getTime() > new Date(row.published_at).getTime() + 1000);

  return {
    id: row.id,
    slug: row.slug,
    status: toStatus(row.status),
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    live,
    draft,
    draftUpdatedAt,
    hasUnpublishedChanges,
  };
}

export function toPhotographySet(row: PhotographySetRow): PhotographySet {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    before: parseMediaRef(row.before_image),
    after: parseMediaRef(row.after_image),
    photographerCredit: row.photographer_credit,
    retouchingCredit: row.retouching_credit,
    status: toStatus(row.status),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    path: row.path,
    kind: row.kind as MediaItem["kind"],
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    width: row.width,
    height: row.height,
    title: row.title,
    altText: row.alt_text,
    originalFilename: row.original_filename,
    createdAt: row.created_at,
  };
}

export function mediaItemToRef(item: MediaItem): MediaRef {
  return {
    id: item.id,
    path: item.path,
    kind: item.kind,
    width: item.width,
    height: item.height,
    alt: item.altText,
  };
}
