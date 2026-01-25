from playwright.sync_api import sync_playwright
import time
import os

def verify_fixes():
    # Ensure verification dir exists
    if not os.path.exists("verification"):
        os.makedirs("verification")

    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844}, # iPhone 12/13/14 viewport
            device_scale_factor=2
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for app to settle
        time.sleep(3)

        # 1. Seed Data
        print("Navigating to System...")
        page.get_by_role("button", name="System").click()
        time.sleep(1)

        print("Switching to Settings mode...")
        # The SegmentedControl has "Metrics" and "Settings"
        # Since SegmentedControl buttons often don't have role="button", try text.
        page.get_by_text("Settings").click()
        time.sleep(1)

        print("Seeding Data...")
        # Handle Confirm Dialogs for Seeding
        # We need to set the handler BEFORE triggering the dialog
        page.on("dialog", lambda dialog: dialog.accept())

        # Click Seed Data button. It might be down the page.
        # Use get_by_role("button", name="Seed Data")
        # Ensure we wait for it
        try:
            seed_btn = page.get_by_role("button", name="Seed Data")
            seed_btn.scroll_into_view_if_needed()
            seed_btn.click()
            print("Seed clicked. Waiting for reload...")

            # The app calls window.location.reload()
            # Playwright handles reload, but we should wait for load state
            page.wait_for_load_state("networkidle")
            time.sleep(3) # Extra wait for React hydration
        except Exception as e:
            print(f"Error seeding: {e}")

        # 2. Verify Horizon Layout (Overflow & Grid)
        print("Verifying Horizon...")
        # Ensure we are on Horizon
        page.get_by_role("button", name="Horizon").click()
        time.sleep(2)

        page.screenshot(path="verification/horizon_fixed.png")
        print("Captured horizon_fixed.png")

        # 3. Verify Daily Check-In Contrast
        print("Verifying Logger Contrast...")
        page.get_by_role("button", name="Logger").click()
        time.sleep(1)

        # Wait for Daily Check-In Form
        # It should show metrics seeded.
        # "Read 30 mins", "Water (oz)", etc.

        page.screenshot(path="verification/logger_contrast.png")
        print("Captured logger_contrast.png")

        # 4. Verify System Data Management Buttons
        print("Verifying System Buttons...")
        page.get_by_role("button", name="System").click()
        time.sleep(1)
        page.get_by_text("Settings").click()
        time.sleep(1)

        page.get_by_text("Universal Export").scroll_into_view_if_needed()
        time.sleep(0.5)

        page.screenshot(path="verification/system_buttons.png")
        print("Captured system_buttons.png")

        browser.close()

if __name__ == "__main__":
    verify_fixes()
