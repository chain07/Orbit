from playwright.sync_api import sync_playwright

def verify_activity_manager(page):
    print("Navigating to app...")
    page.goto("http://localhost:5174")

    # Wait for app to load
    page.wait_for_load_state("networkidle")

    print("Clicking Logger tab (index 1)...")
    logger_tab = page.locator(".tab-item").nth(1)
    logger_tab.click()

    print("Switching to Time Tracker mode...")
    page.get_by_text("Time Tracker").click()

    # Wait for Time Tracker to appear
    page.wait_for_selector("text=Activity")

    # Wait for Activity Manager to appear
    print("Waiting for Activity Manager...")
    page.wait_for_selector("text=Manage Activities")

    print("Taking screenshot of Tracker + Manager...")
    page.screenshot(path="verification/activity_manager_list.png")

    # Click New to open form
    print("Clicking New Activity button...")
    page.get_by_role("button", name="New").click()

    print("Taking screenshot of Activity Form...")
    page.screenshot(path="verification/activity_manager_form.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()
        try:
            verify_activity_manager(page)
            print("Verification complete!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_manager.png")
        finally:
            browser.close()
