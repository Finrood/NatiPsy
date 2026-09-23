import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function captureConsoleErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /hydration|NG0295[25]/i.test(message.text())
    )
      errors.push(message.text());
  });
  return errors;
}

test("home renders the primary heading and has no serious axe violations", async ({
  page,
}) => {
  const errors = await captureConsoleErrors(page);
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(
      ({ impact }) => impact === "critical" || impact === "serious",
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile navigation opens and returns focus to its trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Abrir menu principal" });
  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Menu de navegação" }),
  ).toBeVisible();
  await expect(page.locator("#mobile-menu a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
});

test("blog filter state can be cleared without a stale category query", async ({
  page,
}) => {
  await page.goto("/blog");
  const category = page.locator("#category-filter");
  const option = category.locator("option").filter({ hasText: "Carreira" });
  await expect(option).toHaveCount(1);
  await expect(category).toBeEnabled();
  await category.selectOption({ label: "Carreira" });
  await expect(page).toHaveURL(/category=Carreira/);
  await category.selectOption("");
  await expect(page).not.toHaveURL(/category=/);
});

test("production server returns real statuses for public and unknown routes", async ({
  request,
}) => {
  expect((await request.get("/")).status()).toBe(200);
  expect((await request.get("/blog")).status()).toBe(200);
  expect((await request.get("/does-not-exist")).status()).toBe(404);
});

test("article direct load and client navigation expose one valid article schema", async ({
  page,
}) => {
  const article = "/blog/carreira-mulheres-negras-fadiga-racial";
  await page.goto(article);
  await expect(page.locator("article h1")).toBeVisible();
  await expect(page.locator("#json-ld-blog-post")).toHaveCount(1);
  const schema = JSON.parse(
    await page.locator("#json-ld-blog-post").textContent(),
  );
  expect(
    schema["@graph"].some((entity) => entity["@type"] === "BreadcrumbList"),
  ).toBe(true);

  await page.goto("/blog");
  const articleLink = page.locator('a[href="/blog/carreira-mulheres-negras-fadiga-racial"]').first();
  await expect(articleLink).toHaveAccessibleName(/Mulheres Negras/i);
  await articleLink.click();
  await expect(page.locator("article h1")).toBeVisible();
  await expect(page.locator("#json-ld-blog-post")).toHaveCount(1);
});

test("client route navigation focuses the new page heading and announces it", async ({
  page,
}) => {
  await page.goto("/blog");
  await page.locator('a[href="/blog/carreira-mulheres-negras-fadiga-racial"]').first().click();
  await expect(page.locator("article h1")).toBeFocused();
  await expect(page.locator("#route-announcer")).toContainText(
    "Navegação concluída",
  );
});
