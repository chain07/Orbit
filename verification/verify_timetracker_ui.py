from playwright.sync_api import sync_playwright, expect

def verify_timetracker(page):
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
    print("Waiting for Time Tracker UI...")
    # Depending on implementation, if no metrics exist, it might show "Create Shadow Metric" or "No Metrics".
    # Memory says: "The Logger view implements an inline 'Shadow Metric' creation form when in 'Time Tracker' mode if no time-based metrics exist."
    # So we should expect EITHER "Activity" (if metrics exist) OR the shadow metric creator.
    # But wait, the user's request is to polish the Time Tracker UI. I assume it should render.

    # Let's wait for SOMETHING distinctive in Time Tracker.
    # "Activity" label is in the code I modified.
    page.wait_for_selector("text=Activity", timeout=5000)

    print("Taking screenshot of Manual Mode...")
    page.screenshot(path="verification/manual_mode.png")

    print("Switching to Stopwatch...")
    page.get_by_text("Stopwatch").click()

    page.wait_for_selector("text=00:00:00") # or 00:00:00 depending on formatting

    print("Taking screenshot of Stopwatch Mode...")
    page.screenshot(path="verification/stopwatch_mode.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()
        try:
            verify_timetracker(page)
            print("Verification complete!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_retry.png")
        finally:
            browser.close()
