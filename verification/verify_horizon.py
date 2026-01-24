
from playwright.sync_api import sync_playwright

def verify_horizon_wizard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Horizon - Empty State
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(2000) # Wait for fade-in

        # Verify Horizon Agent is visible (even with empty state)
        if page.get_by_text("I am your Horizon Agent").is_visible():
            print("✅ Horizon Agent text is visible")
        else:
            print("❌ Horizon Agent text is NOT visible")

        # Verify Empty State Button
        launch_btn = page.get_by_role("button", name="Launch Setup")
        if launch_btn.is_visible():
             print("✅ Launch Setup button is visible")
        else:
             print("❌ Launch Setup button is NOT visible")

        page.screenshot(path="verification/horizon_initial.png")

        # 2. Click Launch Setup
        launch_btn.click()
        page.wait_for_timeout(1000)

        # 3. Verify Wizard Opened and Text Updated
        if page.get_by_text("Define Your First Metric").is_visible():
            print("✅ Wizard opened successfully with new title")
        else:
            print("❌ Wizard did NOT open or title mismatch")

        page.screenshot(path="verification/horizon_wizard.png")

        browser.close()

if __name__ == "__main__":
    verify_horizon_wizard()
