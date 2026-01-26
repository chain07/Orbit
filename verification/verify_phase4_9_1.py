from playwright.sync_api import sync_playwright, expect
import time

def verify_phase4_9_1():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844}, # iPhone 12 Pro
            device_scale_factor=3
        )
        page = context.new_page()

        # Handle Dialogs (Accept All)
        page.on("dialog", lambda dialog: dialog.accept())

        try:
            # 1. Load App
            print("Loading app...")
            page.goto("http://localhost:5176")
            page.wait_for_load_state("networkidle")

            # 2. Go to System
            tabs = page.locator(".tab-item")
            expect(tabs).to_have_count(4)

            print("Navigating to System...")
            tabs.nth(3).click()
            time.sleep(1) # Animation

            # Switch to 'Settings' view in System
            print("Switching to Settings...")
            page.get_by_text("Settings", exact=True).click()
            time.sleep(0.5)

            # Look for Seed Data button
            seed_btn = page.get_by_text("Seed Data", exact=True)
            if seed_btn.count() > 0 and seed_btn.is_visible():
                print("Seeding data...")
                seed_btn.click()
                time.sleep(5) # Wait for db and reload
                page.wait_for_load_state("networkidle")
            else:
                print("Seed button not found. Is data already there?")

            # Re-locate tabs after reload
            tabs = page.locator(".tab-item")

            # 3. Go to Horizon (View Widgets)
            print("Navigating to Horizon...")
            tabs.nth(0).click()
            time.sleep(2)

            print("Capturing Horizon screenshot...")
            page.screenshot(path="verification/horizon_phase4_9_1.png")

            # 4. Go to Logger (View Card Stack)
            print("Navigating to Logger...")
            tabs.nth(1).click()
            time.sleep(2)

            # Check for FAB
            fab = page.locator("button[type='submit']").last
            expect(fab).to_be_visible()

            print("Capturing Logger screenshot...")
            page.screenshot(path="verification/logger_phase4_9_1.png")

            # 5. Go to System
            print("Navigating to System...")
            tabs.nth(3).click()
            time.sleep(1)
            page.screenshot(path="verification/system_phase4_9_1.png")

            print("Verification Complete.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_phase4_9_1()
