from playwright.sync_api import Page, expect, sync_playwright
import time
import os

OUTPUT_DIR = "verification"

def verify_orbit(page: Page):
    # Capture console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    print("Navigating to app...")
    page.goto("http://localhost:5173")

    try:
        page.wait_for_selector("text=Daily Briefing", timeout=10000)
    except:
        print("Timeout waiting for 'Daily Briefing'. Taking snapshot.")
        page.screenshot(path=f"{OUTPUT_DIR}/load_fail.png")
        raise

    print("App loaded. Navigating to System...")
    page.locator(".tab-item").nth(3).click()

    expect(page.get_by_text("Configuration")).to_be_visible()

    print("Switching to Settings...")
    page.get_by_text("Settings").click()

    print("Seeding data...")
    page.on("dialog", lambda dialog: dialog.accept())

    page.get_by_role("button", name="Seed Data").click()

    print("Waiting for reload...")
    time.sleep(2)
    page.wait_for_load_state("networkidle")

    # Wait for reload to complete (check for Briefing again)
    page.wait_for_selector("text=Daily Briefing", timeout=20000)

    print("Verifying Horizon content...")
    page.screenshot(path=f"{OUTPUT_DIR}/debug_horizon.png")

    # Expect "Water (oz)" (Ring widget) - exact match to avoid insights
    expect(page.get_by_text("Water (oz)", exact=True)).to_be_visible()

    page.screenshot(path=f"{OUTPUT_DIR}/orbit_horizon.png")

    print("Navigating to Intel...")
    page.locator(".tab-item").nth(2).click()

    page.wait_for_selector("text=Intelligence")
    expect(page.get_by_text("System Health", exact=True)).to_be_visible()

    # Check for "Momentum" which is only visible when hasData (renamed from Intensity)
    expect(page.get_by_text("Momentum", exact=True)).to_be_visible()

    page.screenshot(path=f"{OUTPUT_DIR}/orbit_intel.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_orbit(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path=f"{OUTPUT_DIR}/error.png")
        finally:
            browser.close()
