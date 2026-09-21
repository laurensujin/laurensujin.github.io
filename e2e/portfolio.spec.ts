import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./global-setup";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

async function login(page: Page) {
  await page.goto("/admin/login/");
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/?$/);
}


/**
 * Opens a public case-study page. In `next dev` the list of known slugs is
 * cached and refreshed in the background, so the first visit right after
 * publishing (or unpublishing) can be stale; retry a couple of times.
 */
async function openWork(page: Page, slug: string, expectation: "found" | "missing") {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await page.goto(`/work/${slug}/`);
    const status = response?.status() ?? 0;
    if (expectation === "found" && status === 200) return;
    if (expectation === "missing" && status === 404) return;
    await page.waitForTimeout(700);
  }
  const response = await page.goto(`/work/${slug}/`);
  expect(response?.status()).toBe(expectation === "found" ? 200 : 404);
}

test.describe.configure({ mode: "serial" });

test("public homepage shows the seeded content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Marketing, brand development");
  await expect(page.getByRole("link", { name: "Work", exact: true })).toBeVisible();
  for (const title of ["MAISON DE L’ÉTÉ", "The Reader.", "Poshmark & eBay Reselling", "Writing & Digital Publishing"]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  // No photo sets yet, so the Portrait section is not rendered.
  await expect(page.locator("#photography")).toHaveCount(0);
});

test("profile drawer opens without navigating and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Sujin Lee" });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("Georgia State University");
  await expect(drawer).toContainText("Expected May 2027");
  await expect(page).toHaveURL("/");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});

test("case study page renders its sections", async ({ page }) => {
  await page.goto("/work/maison-de-lete");
  await expect(page.locator("h1")).toHaveText("MAISON DE L’ÉTÉ");
  await expect(page.getByText("Independent Fragrance Brand Development")).toBeVisible();
  await expect(page.getByText("When Summer Sleeps")).toBeVisible();
  // The writeup stays in the admin. Employers only see the work, not the essay.
  await expect(page.getByText("Product development, supplier research, and fragrance prototyping continued")).toHaveCount(0);
  await expect(page.getByText("I independently developed MAISON")).toHaveCount(0);
  // Placeholder link without a URL must not be rendered publicly.
  await expect(page.getByRole("link", { name: /Instagram/ })).toHaveCount(0);
});

test("admin area requires a login", async ({ page }) => {
  await page.goto("/admin/projects/");
  await expect(page).toHaveURL(/\/admin\/login\/\?next=%2Fadmin%2Fprojects/);
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await expect(page.getByRole("alert").filter({ hasText: "Incorrect" })).toContainText("Incorrect email or password");
});

test("create, build, publish and reorder a project from the admin", async ({ page }) => {
  await login(page);
  await page.goto("/admin/projects/");
  await page.getByTestId("add-project").click();
  await page.waitForURL(/\/admin\/projects\/edit\/\?id=[0-9a-f-]{36}$/);

  await page.fill("#title", "E2E Test Project");
  await expect(page.locator("#slug")).toHaveValue("e2e-test-project");
  await page.fill("#subtitle", "Playwright end-to-end check");

  // Heading section
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByRole("button", { name: /^Heading/ }).click();
  const heading = page.locator('[data-block-type="heading"]').last();
  await heading.getByPlaceholder("01").fill("01");
  await heading.getByPlaceholder("Concept").fill("Automated Section");

  // Paragraph section
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByRole("button", { name: /^Paragraph/ }).click();
  const paragraph = page.locator('[data-block-type="paragraph"]').last();
  await paragraph.getByLabel("Paragraph text").fill("This paragraph was written by the end-to-end test.");

  // Large image section with an upload straight into the slot
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByRole("button", { name: /^Large image/ }).click();
  const image = page.locator('[data-block-type="image_large"]').last();
  await image.locator('input[type="file"]').setInputFiles(fixture("cover.png"));
  await expect(image.getByRole("button", { name: "Replace" })).toBeVisible({ timeout: 30_000 });
  await image.getByLabel("Caption").fill("Uploaded by Playwright");

  // Cover image via the basics card
  const coverCard = page.locator("section", { hasText: "Cover image" }).first();
  await coverCard.locator('input[type="file"]').first().setInputFiles(fixture("after.png"));
  await expect(coverCard.getByRole("button", { name: "Replace" }).first()).toBeVisible({ timeout: 30_000 });

  await page.getByTestId("save-draft").click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();

  await page.getByTestId("publish").click();
  await expect(page.getByRole("status").filter({ hasText: "Published" })).toBeVisible();

  // Public page shows the heading and the image, not the paragraph writeup.
  await openWork(page, "e2e-test-project", "found");
  await expect(page.locator("h1")).toHaveText("E2E Test Project");
  await expect(page.getByText("This paragraph was written by the end-to-end test.")).toHaveCount(0);
  await expect(page.getByText("Uploaded by Playwright")).toBeVisible();
  const firstImage = page.locator("article img").first();
  await expect(firstImage).toBeVisible();
  // The optimized image must really load, not just render an empty box.
  await expect.poll(() => firstImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { timeout: 15_000 }).toBe(true);

  // Reorder with the keyboard (dnd-kit): pick up the paragraph, move it up, drop.
  await page.goto("/admin/projects/");
  await page.getByRole("link", { name: "E2E Test Project" }).click();
  await page.waitForURL(/\/admin\/projects\/edit\/\?id=[0-9a-f-]{36}$/);
  const paragraphHandle = page.locator('[data-block-type="paragraph"]').last().getByRole("button", { name: "Drag to reorder" });
  await paragraphHandle.focus();
  // Short pauses between keys, like a person would press them: dnd-kit measures
  // the list on the frame after pick-up.
  await page.keyboard.press("Space");
  await page.waitForTimeout(100);
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(100);
  await page.keyboard.press("Space");
  await expect(page.locator("[data-block-type]").first()).toHaveAttribute("data-block-type", "paragraph");

  await page.getByTestId("publish").click();
  await expect(page.getByRole("status").filter({ hasText: "Published" })).toBeVisible();

  await openWork(page, "e2e-test-project", "found");
  await expect(page.locator("h1")).toHaveText("E2E Test Project");
  await expect(page.getByText("This paragraph was written by the end-to-end test.")).toHaveCount(0);

  // The homepage lists the new project.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "E2E Test Project" })).toBeVisible();
});

test("photography set publishes to the Portrait section with a working lightbox", async ({ page }) => {
  await login(page);
  await page.goto("/admin/photography/new/");
  const before = page.locator("div", { has: page.locator("span:text-is('Before')") }).locator('input[type="file"]').first();
  await before.setInputFiles(fixture("before.png"));
  await expect(page.getByRole("button", { name: "Replace" }).first()).toBeVisible({ timeout: 30_000 });
  const after = page.locator('input[type="file"]').first();
  await after.setInputFiles(fixture("after.png"));
  await expect(page.getByRole("button", { name: "Replace" }).nth(1)).toBeVisible({ timeout: 30_000 });
  await page.fill("#title", "E2E Portrait");
  await page.fill("#photographer", "Sujin Lee");
  await page.selectOption("#status", "published");
  await page.getByTestId("save-set").click();
  await page.waitForURL(/\/admin\/photography\/?$/);
  await expect(page.getByTestId("photo-row")).toHaveCount(1);

  await page.goto("/");
  await expect(page.locator("#photography")).toBeVisible();
  await page.getByRole("button", { name: /Open E2E Portrait/ }).click();
  const lightbox = page.getByRole("dialog", { name: "E2E Portrait" });
  await expect(lightbox).toBeVisible();
  const slider = lightbox.getByRole("slider");
  await expect(slider).toBeVisible();
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).not.toHaveValue("50");
  await expect(lightbox).toContainText("Photography: Sujin Lee");
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
});

test("resume upload appears in the profile drawer", async ({ page }) => {
  await login(page);
  await page.goto("/admin/resume/");
  await page.getByTestId("resume-input").setInputFiles(fixture("resume.pdf"));
  await expect(page.getByText("Current", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("status").filter({ hasText: "Resume uploaded" })).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  const resumeLink = page.getByRole("dialog").getByRole("link", { name: /Resume/ });
  await expect(resumeLink).toBeVisible();
  await expect(resumeLink).toHaveAttribute("href", /\/storage\/v1\/object\/public\/media\/resume\//);
});

test("homepage editor changes the live hero", async ({ page }) => {
  await login(page);
  await page.goto("/admin/homepage/");
  await page.fill("#heroHeadline", "Headline changed\nby the test.");
  await page.getByTestId("save-homepage").click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Headline changed");
});

test("media library warns before deleting a file that is in use", async ({ page }) => {
  await login(page);
  await page.goto("/admin/media/");
  await expect(page.getByTestId("media-card").first()).toBeVisible();
  // The large-image block of the E2E project used the "cover.png" fixture.
  await page.getByTestId("media-card").filter({ hasText: "cover" }).first().click();
  const details = page.getByRole("complementary", { name: "File details" });
  await expect(details).not.toContainText("Checking…");
  await expect(details.getByRole("link", { name: /E2E Test Project \(live\)/ })).toBeVisible();
  await page.getByTestId("delete-media").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("This file is in use");
  await expect(dialog).toContainText("E2E Test Project");
  await dialog.getByRole("button", { name: "Delete file" }).click();
  await expect(page.getByRole("status").filter({ hasText: "File deleted" })).toBeVisible();

  // The public page still works; the removed image is simply gone.
  await openWork(page, "e2e-test-project", "found");
  await expect(page.locator("h1")).toHaveText("E2E Test Project");
  await expect(page.getByText("Uploaded by Playwright")).toHaveCount(0);
});

test("unpublishing hides the project from visitors", async ({ page }) => {
  await login(page);
  await page.goto("/admin/projects/");
  await page.getByRole("link", { name: "E2E Test Project" }).click();
  await page.getByRole("button", { name: "Unpublish", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "unpublished" })).toBeVisible();
  await openWork(page, "e2e-test-project", "missing");
});
