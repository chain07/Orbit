
from playwright.sync_api import sync_playwright
import time

def verify_layout_and_logic():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("--- Verifying Horizon View ---")
        # 1. Horizon - Empty State
        page.goto("http://localhost:5173/")
        try:
            page.wait_for_selector("text=I am your Horizon Agent", timeout=5000)
            print("✅ Horizon Agent text is visible")
        except:
            print("❌ Horizon Agent text is NOT visible")

        # Verify Empty State Button
        try:
            page.wait_for_selector("button:has-text('Launch Setup')", timeout=5000)
            print("✅ Launch Setup button is visible")
        except:
            print("❌ Launch Setup button is NOT visible")

        page.screenshot(path="verification/horizon_initial.png")

        # 2. Click Launch Setup
        page.click("button:has-text('Launch Setup')")

        # 3. Verify Wizard Opened and Text Updated
        try:
            # Wait for the specific text in the modal
            page.wait_for_selector("text=Define Your First Metric", timeout=5000)
            print("✅ Wizard opened successfully with new title")
        except:
            print("❌ Wizard did NOT open or title mismatch")
            # Dump content to debug
            with open("verification/debug_page_content.txt", "w") as f:
                f.write(page.content())

        page.screenshot(path="verification/horizon_wizard.png")

        # 4. Verify Logger View Logic
        print("\n--- Verifying Logger View ---")
        # Navigate to Logger (assuming tab navigation or URL)
        # Clicking the Logger icon in BottomNav.
        # BottomNav icons are usually by index. Logger is index 1.
        # Finding the second button in the bottom nav.

        # The BottomNav uses .tab-item class.
        # The order is fixed: Horizon (0), Logger (1), Intel (2), System (3)

        buttons = page.locator(".tab-item")
        if buttons.count() >= 2:
            buttons.nth(1).click()
            print("Clicked Logger tab (index 1)")

            # Wait for transition
            page.wait_for_timeout(1000)

            # Check for "Logger" header
            if page.get_by_text("Logger").first.is_visible():
                print("✅ Navigated to Logger view")

            # Check for Segmented Control (Time Tracker / Daily Check-In)
            # It should be visible even if empty state is there.
            if page.get_by_text("Time Tracker").is_visible() and page.get_by_text("Daily Check-In").is_visible():
                print("✅ Segmented Control is visible")
            else:
                print("❌ Segmented Control is NOT visible")

            # Check for Empty State
            if page.get_by_text("No Metrics").is_visible() or page.get_by_text("Input engine").is_visible():
                 print("✅ Empty/Initial state visible")

            page.screenshot(path="verification/logger_view.png")

        else:
            print("❌ Could not find navigation buttons")

        browser.close()

if __name__ == "__main__":
    verify_layout_and_logic()
