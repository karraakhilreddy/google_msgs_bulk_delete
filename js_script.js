/**
 * Bulk-delete Google Messages conversations on https://messages.google.com/web
 *
 * Google has no "Select all" button. This script automates what you'd do by hand:
 * open each conversation menu → Delete → confirm.
 *
 * HOW TO USE
 * 1. Open https://messages.google.com/web and sign in / pair your phone.
 * 2. Press F12 (or Ctrl+Shift+J) → Console tab.
 * 3. Paste this entire file and press Enter.
 * 4. Run: startBulkDelete()
 * 5. To stop: stopDeleting() and stopScrolling()
 *
 * NOTES
 * - Deleted chats go to Trash for 30 days (Profile → Trash → Delete all to purge).
 * - Only visible conversations are processed; run scrollToLoadAll() first if you have many.
 * - Deletion is permanent after emptying Trash. Back up anything important first.
 */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clickByText(selector, text, root = document) {
  const items = root.querySelectorAll(selector);
  for (const item of items) {
    const label = (item.innerText || item.textContent || "").trim();
    if (label.toLowerCase() === text.toLowerCase()) {
      item.click();
      return true;
    }
  }
  return false;
}

// --- Auto-scroll to load all conversations into the list ---

window.stopScrolling = () => {
  clearInterval(window.scrollIntervalId);
  console.log("Auto-scroll stopped.");
};

window.scrollToLoadAll = () => {
  const container =
    document.querySelector(".conversation-list") ||
    document.querySelector("mws-conversations-list nav");

  if (!container) {
    console.error("Scroll container not found. Try scrolling the list manually first.");
    return;
  }

  let lastScrollTop = -1;
  let triesWithoutChange = 0;
  const maxTries = 60;

  window.scrollIntervalId = setInterval(() => {
    container.scrollTop += 500;
    console.log("Scrolling…", container.scrollTop);

    if (container.scrollTop === lastScrollTop) {
      triesWithoutChange++;
      if (triesWithoutChange >= maxTries) {
        clearInterval(window.scrollIntervalId);
        console.log("Done scrolling — all conversations should be loaded.");
      }
    } else {
      lastScrollTop = container.scrollTop;
      triesWithoutChange = 0;
    }
  }, 1000);
};

// --- Bulk delete ---

let isDeleting = true;
let deleteIndex = 0;
let deletedCount = 0;
let failedCount = 0;

window.stopDeleting = () => {
  isDeleting = false;
  console.log("Bulk delete stopped.");
};

window.startBulkDelete = async () => {
  isDeleting = true;
  deleteIndex = 0;
  deletedCount = 0;
  failedCount = 0;
  console.log("Starting bulk delete…");
  await deleteNextConversation();
};

async function confirmDeleteDialog() {
  await sleep(400);

  const overlay = document.querySelector(".cdk-overlay-container");
  if (!overlay) return false;

  const buttons = overlay.querySelectorAll("button");
  for (const btn of buttons) {
    const label = (btn.innerText || btn.textContent || "").trim().toLowerCase();
    if (
      label === "delete" ||
      label === "move to trash" ||
      label === "move to bin" ||
      label === "trash"
    ) {
      btn.click();
      return true;
    }
  }

  return clickByText("button", "Delete", overlay);
}

async function deleteNextConversation() {
  if (!isDeleting) {
    console.log("Delete loop stopped.");
    return;
  }

  const menuButtons = document.querySelectorAll("button.menu-button");

  if (deleteIndex >= menuButtons.length) {
    console.log(
      `Finished visible list. Deleted: ${deletedCount}, skipped/failed: ${failedCount}.`
    );
    console.log(
      "If more conversations remain, scroll down or refresh and run startBulkDelete() again."
    );
    return;
  }

  const currentButton = menuButtons[deleteIndex];
  console.log(`Deleting ${deleteIndex + 1} / ${menuButtons.length}…`);

  try {
    currentButton.click();
    await sleep(350);

    const clickedDelete = clickByText("button.mat-mdc-menu-item", "Delete");
    if (!clickedDelete) {
      // Close menu and skip if Delete isn't in this menu
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      console.warn("Delete option not found — skipping.");
      deleteIndex++;
      failedCount++;
      await sleep(300);
      return deleteNextConversation();
    }

    await sleep(350);
    await confirmDeleteDialog();
    await sleep(900);

    const overlay = document.querySelector(".cdk-overlay-container");
    const error =
      overlay?.innerText.includes("Could not delete") ||
      overlay?.innerText.includes("Could not archive");

    if (error) {
      console.error("Delete failed for this thread — skipping.");
      deleteIndex++;
      failedCount++;
    } else {
      console.log("Deleted.");
      deletedCount++;
      // Don't increment index — list shifts up after successful delete
    }

    await sleep(500);
    return deleteNextConversation();
  } catch (err) {
    console.error("Unexpected error:", err);
    deleteIndex++;
    failedCount++;
    await sleep(1000);
    return deleteNextConversation();
  }
}

console.log("Loaded. Run scrollToLoadAll() then startBulkDelete().");
console.log("Stop anytime with stopDeleting() / stopScrolling().");
