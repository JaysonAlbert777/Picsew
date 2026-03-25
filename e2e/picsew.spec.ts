import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoVideoPath = path.join(repoRoot, "demo.MP4");

test.describe("Picsew", () => {
  test("home page shows upload flow", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Long Screenshot Generator" }),
    ).toBeVisible();
    await expect(page.getByText("Upload Screen Recording")).toBeVisible();
    await expect(page.getByText("Select Video")).toBeVisible();
  });

  test("demo.MP4: upload through processing to preview", async ({ page }) => {
    // Optional local asset (*.MP4 is gitignored); CI runs smoke test only.
    // eslint-disable-next-line playwright/no-skipped-test -- intentional when demo.MP4 absent
    test.skip(!existsSync(demoVideoPath), "demo.MP4 not found at project root");

    await page.goto("/");
    await page
      .locator('input[type="file"][accept*="video"]')
      .setInputFiles(demoVideoPath);

    await expect(page.getByText("demo.MP4", { exact: true })).toBeVisible();

    const startBtn = page.getByRole("button", { name: /Start Processing/i });
    await expect(startBtn).toBeEnabled({ timeout: 180_000 });

    await startBtn.click();

    await expect(page.getByText("Processing Complete")).toBeVisible({
      timeout: 900_000,
    });
    await expect(
      page.getByRole("button", { name: /Download Image/i }),
    ).toBeVisible();
  });
});
