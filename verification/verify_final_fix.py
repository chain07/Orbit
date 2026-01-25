import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_final_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 812})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # 1. Verify Seeding works (indirectly by checking if widgets load or if we can seed)
        # If we are stuck on empty state, we seed.
        try:
             expect(page.locator(".layout-content .grid").first).to_be_visible(timeout=3000)
             print("Widgets found.")
        except:
             print("Widgets not found, attempting to seed...")
             page.locator(".tab-item").nth(3).click() # System
             page.wait_for_timeout(500)
             page.get_by_text("Settings").click()
             page.wait_for_timeout(500)
             seed_btn = page.get_by_text("Seed Data")
             seed_btn.scroll_into_view_if_needed()
             page.once("dialog", lambda dialog: dialog.accept())
             seed_btn.click()
             page.wait_for_timeout(5000)
             page.reload()
             page.wait_for_selector("main", state="visible")

        # 2. Capture Horizon View
        print("Capturing Horizon View...")
        page.locator(".tab-item").nth(0).click()
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/visual_horizon_final.png")

        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    verify_final_fix()
