import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoVideoPath = path.join(repoRoot, "demo.MP4");
const testVideoPath = path.join(repoRoot, "test-video.mp4");

/**
 * Helper function to run video processing test with console error detection
 */
async function runVideoProcessingTest(
  page: Page,
  videoPath: string,
  videoName: string,
) {
  // Capture console logs and errors
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    // Capture error-level logs
    if (msg.type() === "error") {
      consoleErrors.push(text);
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on("pageerror", (error: Error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");

  // Use setInputFiles for video upload
  await page
    .locator('input[type="file"][accept*="video"]')
    .setInputFiles(videoPath);

  await expect(page.getByText(videoName, { exact: true })).toBeVisible();

  const startBtn = page.getByRole("button", { name: /Start Processing/i });
  await expect(startBtn).toBeEnabled({ timeout: 180_000 });

  await startBtn.click();

  // Wait for processing to complete
  await expect(page.getByText("Processing Complete")).toBeVisible({
    timeout: 900_000,
  });
  await expect(
    page.getByRole("button", { name: /Download Image/i }),
  ).toBeVisible();

  // Verify no console errors occurred
  expect(
    consoleErrors,
    `Console errors detected: ${consoleErrors.join(", ")}`,
  ).toHaveLength(0);
  expect(
    pageErrors,
    `Page errors detected: ${pageErrors.join(", ")}`,
  ).toHaveLength(0);

  // Verify at least 2 keyframes were detected (if logs available)
  const keyframeLog = consoleLogs.find((log) =>
    log.includes("final keyframes"),
  );
  if (keyframeLog) {
    const keyframeMatch = keyframeLog.match(/(\d+) final keyframes/);
    if (keyframeMatch && keyframeMatch[1]) {
      const keyframeCount = parseInt(keyframeMatch[1], 10);
      expect(keyframeCount).toBeGreaterThanOrEqual(2);
    }
  }
}

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
    test.skip(!existsSync(demoVideoPath), "demo.MP4 not found at project root");

    await runVideoProcessingTest(page, demoVideoPath, "demo.MP4");
  });

  test("test-video.mp4: upload through processing to preview", async ({
    page,
  }) => {
    // Optional local asset
    test.skip(
      !existsSync(testVideoPath),
      "test-video.mp4 not found at project root",
    );

    await runVideoProcessingTest(page, testVideoPath, "test-video.mp4");
  });
});
