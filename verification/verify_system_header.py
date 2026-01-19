from playwright.sync_api import sync_playwright

def verify_system_polish():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile-like viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 812},
            device_scale_factor=2
        )
        page = context.new_page()

        print("Navigating to System view...")
        page.goto("http://localhost:5177")

        print("Clicking System icon (4th tab)...")
        # Use CSS selector for the 4th tab item
        page.locator(".tab-item").nth(3).click()

        # Wait for System header
        page.wait_for_selector("h1:has-text('System')")

        # 2. Screenshot Metrics View (New Header Layout)
        print("Taking Metrics View screenshot (New Header)...")
        # Ensure we are in Metrics mode (default)
        page.wait_for_selector("text=No Metrics")
        page.screenshot(path="verification/system_header_structure.png")

        browser.close()

if __name__ == "__main__":
    verify_system_polish()
