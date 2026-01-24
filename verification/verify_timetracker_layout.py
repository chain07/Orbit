from playwright.sync_api import sync_playwright

def verify_timetracker_layout(page):
    print("Navigating to app...")
    page.goto("http://localhost:5174")

    # Wait for app to load
    page.wait_for_load_state("networkidle")

    print("Clicking Logger tab (index 1)...")
    logger_tab = page.locator(".tab-item").nth(1)
    logger_tab.click()

    print("Switching to Time Tracker mode...")
    # Click the segment control for Time Tracker
    page.get_by_text("Time Tracker").click()

    # Wait for Time Tracker to appear
    page.wait_for_selector("text=Activity")

    print("Taking screenshot of Time Tracker Manual Layout...")
    page.screenshot(path="verification/timetracker_grouped_layout.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()
        try:
            verify_timetracker_layout(page)
            print("Verification complete!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_layout.png")
        finally:
            browser.close()
