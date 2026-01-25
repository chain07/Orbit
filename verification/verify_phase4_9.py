from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 375, 'height': 812}) # iPhone X size
        page = context.new_page()

        print("Navigating to app...")
        # Handle dialogs automatically (Accept all)
        page.on("dialog", lambda dialog: dialog.accept())

        page.goto("http://localhost:5176")
        time.sleep(2)

        # Seeding
        print("Navigating to System...")
        # BottomNav uses icons, click 4th tab (index 3)
        page.locator(".tab-item").nth(3).click()
        time.sleep(0.5)

        # Switch to Settings (Segmented Control)
        print("Switching to Settings mode...")
        page.click("text=Settings")
        time.sleep(1)

        try:
            print("Seeding Data...")
            page.click("text=Seed Data")
            time.sleep(1)
            # Handle confirm dialog if any?
            # The code for seedTestData doesn't seem to have a confirm dialog in the button click,
            # but usually nuking does. Seeding might just run.
            # Wait for reload? OrbitDB operations are async but local state updates.
            time.sleep(2)
        except:
            print("Could not click Populate Test Data. Maybe not visible.")

        # Horizon
        print("Verifying Horizon Widgets...")
        page.locator(".tab-item").nth(0).click()
        time.sleep(2)
        page.screenshot(path="verification/horizon_phase4_9.png")
        print("Captured horizon_phase4_9.png")

        # Logger
        print("Verifying Logger Check-In...")
        page.locator(".tab-item").nth(1).click()
        time.sleep(1)
        # Ensure "Daily Check-In" tab is active (default)
        page.screenshot(path="verification/logger_phase4_9.png")
        print("Captured logger_phase4_9.png")

        browser.close()

if __name__ == "__main__":
    run()
