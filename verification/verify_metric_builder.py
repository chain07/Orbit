from playwright.sync_api import sync_playwright

def verify_metric_builder():
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
        page.locator(".tab-item").nth(3).click()
        page.wait_for_selector("h1:has-text('System')")

        # 1. Open Metric Builder
        print("Opening Metric Builder...")
        # Assuming we are on Metrics view (default)
        page.get_by_text("Add New Metric").click()

        print("Waiting for modal...")
        page.wait_for_timeout(2000)

        print("Taking debug screenshot...")
        page.screenshot(path="verification/debug_modal_open.png")

        browser.close()

if __name__ == "__main__":
    verify_metric_builder()
