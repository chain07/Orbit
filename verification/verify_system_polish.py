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

        # The bottom nav uses icons, not text labels, for rendering.
        # But the tabs config in NavigationContext has { label: 'System' ... }.
        # However, BottomNav.jsx renders:
        # {tab.icon} inside a div.
        # It does NOT render {tab.label}.
        # So page.get_by_text("System") fails because the text is not there!

        # We need to click the 4th tab-item.
        # Structure: .tab-bar-container .tab-bar .tab-item (x4)

        print("Clicking System icon (4th tab)...")
        # Use CSS selector for the 4th tab item
        page.locator(".tab-item").nth(3).click()

        # Wait for System header
        page.wait_for_selector("h1:has-text('System')")

        # 2. Screenshot Metrics View
        print("Taking Metrics View screenshot...")
        # Ensure we are in Metrics mode (default)
        page.wait_for_selector("text=No Metrics")
        page.screenshot(path="verification/system_metrics_view.png")

        # 3. Toggle to Settings
        print("Toggling to Settings...")
        # SegmentedControl uses text
        page.get_by_text("Settings", exact=True).click()

        # Wait for Storage section
        page.wait_for_selector("text=Storage")

        # 4. Screenshot Settings View
        print("Taking Settings View screenshot...")
        # wait a bit for animations
        page.wait_for_timeout(500)
        page.screenshot(path="verification/system_settings_view.png")

        browser.close()

if __name__ == "__main__":
    verify_system_polish()
