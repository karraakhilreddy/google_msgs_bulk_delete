# Google Messages — bulk delete

Google Messages has **no "Select all"** button on web or mobile. These scripts automate deletion on [messages.google.com/web](https://messages.google.com/web).

## Quick start (web)

1. Open [messages.google.com/web](https://messages.google.com/web) and pair your phone.
2. Press **F12** → **Console** tab (or **Ctrl+Shift+J** on Windows).
3. Copy the contents of `delete-all-conversations.js`, paste into the console, press **Enter**.
4. Run:
   ```js
   scrollToLoadAll()   // optional — loads all conversations if you have hundreds/thousands
   startBulkDelete()   // starts deleting one by one
   ```
5. Stop anytime:
   ```js
   stopDeleting()
   stopScrolling()
   ```

## After deleting

- Conversations go to **Trash** for 30 days (not instantly permanent).
- To wipe them completely: **Profile icon → Trash → Delete** (with nothing selected = delete all in trash).

## Alternatives

| Method | Notes |
|--------|--------|
| **Phone app** | Long-press a chat → tap others → trash icon. No select-all. |
| **Archive instead** | Safer; hides chats without deleting. Use community archive scripts if you only want inbox cleanup. |
| **SMS Backup & Restore** | Can delete all SMS on device (requires changing approach / backup first). |
| **Samsung Messages** | Some Samsung phones support bulk delete in Samsung's app, then switch back to Google Messages. |

## Warnings

- **Back up first** if you might need old texts.
- Google can change the site UI; if the script stops working, the menu selectors may need updating.
- Only run scripts you understand. This mimics manual clicks in your own browser session.
