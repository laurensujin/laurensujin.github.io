"use client";

import { useState } from "react";
import { saveProfile } from "@/lib/actions/profile";
import type { Education, Profile, SocialLink } from "@/lib/data/types";
import { newId } from "@/lib/utils";
import { MediaField } from "./MediaField";
import { useToast } from "./Toast";
import { ItemList } from "./blocks/ItemList";
import { Button, Card, Field, Input, PageHeader, Select, Textarea, Toggle } from "./ui";

interface Props {
  profile: Profile;
  education: Education[];
  links: SocialLink[];
}

const KINDS: { value: SocialLink["kind"]; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

/** Profile drawer content: bio, image, education and links. */
export function ProfileForm(props: Props) {
  const toast = useToast();
  const [profile, setProfile] = useState(props.profile);
  const [education, setEducation] = useState(props.education);
  const [links, setLinks] = useState(props.links);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const result = await saveProfile({
      profile,
      education: education.map(({ id, school, college, degree, major, graduation }) => ({ id, school, college, degree, major, graduation })),
      links: links.map(({ id, label, url, kind, showInProfile, showInFooter }) => ({ id, label, url, kind, showInProfile, showInFooter })),
    });
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");
    toast("Profile saved");
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Shown in the PROFILE drawer. Links also feed the footer."
        actions={
          <Button variant="primary" onClick={save} loading={busy} data-testid="save-profile">
            Save
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="About">
          <div className="flex flex-col gap-4">
            <Field label="Name" htmlFor="name">
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Professional title" htmlFor="title" hint="e.g. Marketing · Brand · Product">
              <Input id="title" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
            </Field>
            <Field label="Location" htmlFor="location">
              <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
            </Field>
            <Field label="Short biography" htmlFor="about">
              <Textarea id="about" rows={6} value={profile.about} onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
            </Field>
            <MediaField label="Profile image" value={profile.image} onChange={(image) => setProfile({ ...profile, image })} hint="Portrait orientation (4:5) looks best." />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Education">
            <ItemList
              items={education}
              onChange={setEducation}
              addLabel="Add education"
              create={() => ({ id: newId(), school: "", college: "", degree: "", major: "", graduation: "", sortOrder: education.length + 1 })}
              renderItem={(item, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={item.school} onChange={(e) => update({ school: e.target.value })} placeholder="School" aria-label="School" />
                  <Input value={item.college} onChange={(e) => update({ college: e.target.value })} placeholder="College (optional)" aria-label="College" />
                  <Input value={item.degree} onChange={(e) => update({ degree: e.target.value })} placeholder="Degree" aria-label="Degree" />
                  <Input value={item.major} onChange={(e) => update({ major: e.target.value })} placeholder="Major" aria-label="Major" />
                  <Input value={item.graduation} onChange={(e) => update({ graduation: e.target.value })} placeholder="Graduation, e.g. Expected May 2027" aria-label="Graduation" className="sm:col-span-2" />
                </div>
              )}
            />
          </Card>

          <Card title="Links" description="Email links open the visitor's mail app. Links without a URL stay hidden.">
            <ItemList
              items={links}
              onChange={setLinks}
              addLabel="Add link"
              create={() => ({ id: newId(), label: "", url: "", kind: "other" as SocialLink["kind"], showInProfile: true, showInFooter: true, sortOrder: links.length + 1 })}
              renderItem={(link, update) => (
                <div className="flex flex-col gap-2">
                  <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1.5fr]">
                    <Select value={link.kind} onChange={(e) => update({ kind: e.target.value as SocialLink["kind"] })} aria-label="Type">
                      {KINDS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </Select>
                    <Input value={link.label} onChange={(e) => update({ label: e.target.value })} placeholder="Label" aria-label="Label" />
                    <Input value={link.url} onChange={(e) => update({ url: e.target.value })} placeholder={link.kind === "email" ? "you@example.com" : "https://"} aria-label="URL" />
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <Toggle checked={link.showInProfile} onChange={(showInProfile) => update({ showInProfile })} label="Show in profile" />
                    <Toggle checked={link.showInFooter} onChange={(showInFooter) => update({ showInFooter })} label="Show in footer" />
                  </div>
                </div>
              )}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
