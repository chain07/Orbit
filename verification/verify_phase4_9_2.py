
import time
from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate iPhone 12 Pro for mobile view
        device = p.devices['iPhone 12 Pro']
        context = browser.new_context(**device)
        page = context.new_page()

        print("Navigating to App...")
        page.goto("http://localhost:5176")
        time.sleep(2)

        # Handle Dialogs (Confirmations)
        page.on("dialog", lambda dialog: dialog.accept())

        # 1. Reset & Seed Data
        print("Navigating to System Tab (Tab 4)...")
        # Assuming Tab 3 (0-indexed) is System
        tabs = page.locator(".tab-item")
        if tabs.count() >= 4:
            tabs.nth(3).click()
        else:
            print("Could not find 4 tabs. Trying to find System via text...")

        time.sleep(1)

        # Switch to Settings (System view has segmented control?)
        # Try to find "Settings" tab/button
        try:
            settings_tab = page.get_by_text("Settings", exact=True)
            if settings_tab.is_visible():
                print("Switching to Settings View...")
                settings_tab.click()
                time.sleep(1)
        except:
            print("Settings tab not found, maybe already there?")

        # Click "Reset DB" if exists (Red button)
        reset_btn = page.get_by_text("Reset DB")
        if reset_btn.is_visible():
            print("Resetting DB...")
            reset_btn.click()
            time.sleep(3) # Wait for reload
            page.wait_for_load_state("networkidle")

            # Navigate back to System if reset kicked us to Home
            tabs = page.locator(".tab-item")
            if tabs.count() >= 4:
                tabs.nth(3).click()
                time.sleep(1)
                # Switch to Settings again
                page.get_by_text("Settings", exact=True).click()
                time.sleep(1)

        # Click "Seed Data"
        seed_btn = page.get_by_text("Seed Data")
        if seed_btn.is_visible():
            print("Seeding Data...")
            seed_btn.click()
            time.sleep(5) # Wait for seed and reload
            page.wait_for_load_state("networkidle")

            # Re-locate tabs
            tabs = page.locator(".tab-item")
        else:
            print("Seed Data button not found!")

        # 2. Verify Horizon View (Tab 0)
        print("Navigating to Horizon Tab...")
        if tabs.count() > 0:
            tabs.nth(0).click()
            time.sleep(2)

        # Check for History Widget
        # It should have title "Journal"
        if page.get_by_text("Journal").is_visible():
            print("SUCCESS: History Widget 'Journal' found.")
        else:
            print("FAILURE: History Widget 'Journal' NOT found.")

        page.screenshot(path="verification/horizon_phase4_9_2.png")
        print("Screenshot saved: horizon_phase4_9_2.png")

        # 3. Verify Edit Mode
        print("Activating Edit Mode...")
        edit_btn = page.get_by_text("Edit")
        if edit_btn.is_visible():
            edit_btn.click()
            time.sleep(1)
            page.screenshot(path="verification/horizon_edit_phase4_9_2.png")
            print("Screenshot saved: horizon_edit_phase4_9_2.png")
            # Exit edit mode
            page.get_by_text("Done").click()
            time.sleep(1)
        else:
            print("Edit button not found.")

        # 4. Verify Logger View (Tab 1)
        print("Navigating to Logger Tab...")
        if tabs.count() > 1:
            tabs.nth(1).click()
            time.sleep(2)
            page.screenshot(path="verification/logger_phase4_9_2.png")
            print("Screenshot saved: logger_phase4_9_2.png")

        browser.close()

if __name__ == "__main__":
    verify_app()
