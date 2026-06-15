"""
Real Rails PoC 44 — UAT Automation Script (v2)
Tests the live deployment using Selenium WebDriver.

Usage:
    pip install selenium webdriver-manager
    python uat_test.py
"""

import time
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


# ── Config ──────────────────────────────────────────────────────────────────

TARGET_URL = "https://real-rails-web-7r16.onrender.com"
YOUR_NAME = "Haifa"

NODE_ID_TO_SELECT = "E005"  # PulseSDK

# Render free tier cold starts can take well over a minute.
PAGE_LOAD_TIMEOUT = 180     # max time to attempt initial navigation
COLD_START_WAIT   = 180     # max time to wait for canvas/page-ready after navigation
ELEMENT_TIMEOUT   = 30      # normal element wait once page is warm

REPORT_FILE = "Test_Report.txt"


# ── Helpers ─────────────────────────────────────────────────────────────────

results = []

def log_result(test_name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append((test_name, status, detail))
    print(f"[{status}] {test_name} — {detail}")


def write_report():
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("REAL RAILS — PoC 44 — UAT TEST REPORT\n")
        f.write(f"Target URL : {TARGET_URL}\n")
        f.write(f"Run at     : {datetime.now().isoformat(timespec='seconds')}\n")
        f.write("=" * 60 + "\n\n")

        passed_count = sum(1 for _, status, _ in results if status == "PASS")
        total = len(results)

        for name, status, detail in results:
            f.write(f"[{status}] {name}\n")
            if detail:
                f.write(f"       -> {detail}\n")
            f.write("\n")

        f.write("-" * 60 + "\n")
        f.write(f"SUMMARY: {passed_count}/{total} tests passed\n")
        f.write("-" * 60 + "\n")

    print(f"\nReport written to {REPORT_FILE}")


def get_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def navigate_with_cold_start_handling(driver):
    """
    Render free tier cold starts can exceed the normal page-load timeout.
    Attempt navigation; if it times out, the server may still be warming up
    and finish rendering shortly after — so we don't treat this as fatal.
    Instead we poll until the canvas element appears or COLD_START_WAIT elapses.
    """
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    try:
        driver.get(TARGET_URL)
        print("Initial navigation completed normally.")
        return True
    except Exception as e:
        print(f"Initial navigation timed out ({e.__class__.__name__}) — "
              f"likely Render cold start. Polling for readiness...")

    # Poll until the canvas (Cytoscape) appears, or we give up
    deadline = time.time() + COLD_START_WAIT
    while time.time() < deadline:
        try:
            canvas = driver.find_elements(By.TAG_NAME, "canvas")
            if canvas and canvas[0].is_displayed():
                print("Page became ready during cold-start polling.")
                return True
        except Exception:
            pass
        time.sleep(2)

    print("Page did not become ready within cold-start window.")
    return False


# ── Test Case 1: Visual Load ────────────────────────────────────────────────

def test_visual_load(driver, wait):
    test_name = "Test 1: Visual Load (background + map container)"
    try:
        outer = driver.find_element(By.CSS_SELECTOR, "body > div")
        bg = outer.value_of_css_property("background-image") or outer.value_of_css_property("background-color")
        bg_ok = bool(bg) and bg != "none" and "rgba(0, 0, 0, 0)" not in bg

        canvas = wait.until(EC.presence_of_element_located((By.TAG_NAME, "canvas")))
        canvas_visible = canvas.is_displayed()

        passed = bg_ok and canvas_visible
        detail = f"background='{bg[:60]}...' canvas_visible={canvas_visible}"
        log_result(test_name, passed, detail)
        return passed

    except Exception as e:
        log_result(test_name, False, f"Exception: {e}")
        return False


# ── Test Case 2: The Handshake ─────────────────────────────────────────────

def test_handshake(driver, wait):
    test_name = "Test 2: The Handshake (node click -> Intelligence Panel)"
    try:
        # Wait (generously) for the test hook to be registered on window
        long_wait = WebDriverWait(driver, ELEMENT_TIMEOUT * 2)
        long_wait.until(lambda d: d.execute_script(
            "return typeof window.__testSelectNode === 'function'"
        ))

        success = driver.execute_script(
            f"return window.__testSelectNode('{NODE_ID_TO_SELECT}')"
        )
        if not success:
            log_result(test_name, False, f"Test hook returned false — node '{NODE_ID_TO_SELECT}' not found")
            return False

        time.sleep(1)  # allow 340ms slide transition + buffer

        panel_header = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//span[contains(text(), 'INTELLIGENCE PANEL')]")
            )
        )
        panel_container = panel_header.find_element(By.XPATH, "../..")
        transform = panel_container.value_of_css_property("transform")

        tx_zero = False
        if transform.startswith("matrix("):
            parts = transform.replace("matrix(", "").replace(")", "").split(",")
            tx = float(parts[4].strip())
            tx_zero = abs(tx) < 5

        passed = tx_zero
        detail = f"panel transform='{transform}'"
        log_result(test_name, passed, detail)
        return passed

    except Exception as e:
        log_result(test_name, False, f"Exception: {e}")
        return False


# ── Test Case 3: The Signature ─────────────────────────────────────────────

def test_signature(driver, wait):
    test_name = "Test 3: The Signature (info icon -> name present)"
    try:
        info_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='i']"))
        )
        info_button.click()
        time.sleep(0.5)

        popover = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//div[contains(text(), 'PROJECT INFO')]/..")
            )
        )

        popover_text = popover.text
        name_present = YOUR_NAME.strip().lower() in popover_text.lower()

        passed = name_present
        detail = (
            f"Looking for '{YOUR_NAME}' in popover text. "
            f"Found={name_present}. Popover text snippet: {popover_text[:150]!r}"
        )
        log_result(test_name, passed, detail)
        return passed

    except Exception as e:
        log_result(test_name, False, f"Exception: {e}")
        return False


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"Starting UAT against {TARGET_URL}")
    print("(Render free tier may cold-start — first load can take up to 3 minutes)\n")

    driver = get_driver()
    wait = WebDriverWait(driver, ELEMENT_TIMEOUT)

    try:
        ready = navigate_with_cold_start_handling(driver)
        if not ready:
            for name in [
                "Test 1: Visual Load (background + map container)",
                "Test 2: The Handshake (node click -> Intelligence Panel)",
                "Test 3: The Signature (info icon -> name present)",
            ]:
                log_result(name, False, "Page never became ready (cold start exceeded limit)")
        else:
            test_visual_load(driver, wait)
            test_handshake(driver, wait)
            test_signature(driver, wait)
    finally:
        driver.quit()

    write_report()


if __name__ == "__main__":
    main()
