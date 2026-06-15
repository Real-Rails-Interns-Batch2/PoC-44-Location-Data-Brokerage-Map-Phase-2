"""
Real Rails PoC 44 — UAT Automation Script
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
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


# ── Config ──────────────────────────────────────────────────────────────────

TARGET_URL = "https://real-rails-web-7r16.onrender.com"

# >>> EDIT THIS to match what you add to META_INFO.author in page.tsx <<<
YOUR_NAME = "Haifa"

# Pixel offset of node E005 (PulseSDK) relative to the graph canvas,
# based on its initial_position {x:120, y:100} in src/lib/api.ts
NODE_CLICK_OFFSET = (120, 100)

PAGE_LOAD_TIMEOUT = 60   # Render free tier can cold-start (30-60s)
ELEMENT_TIMEOUT   = 20

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


# ── Driver setup ────────────────────────────────────────────────────────────

def get_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return driver


# ── Test Case 1: Visual Load ────────────────────────────────────────────────

def test_visual_load(driver, wait):
    test_name = "Test 1: Visual Load (background + map container)"
    try:
        driver.get(TARGET_URL)

        # Wait for the root fixed-position container to render
        root = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div")))

        # Find the outermost div with the dark gradient background
        # (rendered with position: fixed, inset: 0 in page.tsx)
        outer = driver.find_element(By.CSS_SELECTOR, "body > div")
        bg = outer.value_of_css_property("background-image") or outer.value_of_css_property("background-color")

        bg_ok = bool(bg) and bg != "none" and "rgba(0, 0, 0, 0)" not in bg

        # Wait for the graph canvas (Cytoscape) to mount
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
        canvas = wait.until(EC.presence_of_element_located((By.TAG_NAME, "canvas")))

        # Click at the pixel position of node E005 (PulseSDK)
        actions = ActionChains(driver)
        actions.move_to_element(canvas).move_by_offset(
            NODE_CLICK_OFFSET[0] - canvas.size["width"] // 2,
            NODE_CLICK_OFFSET[1] - canvas.size["height"] // 2,
        ).click().perform()

        time.sleep(1)  # allow 340ms slide transition + buffer

        # Locate the Intelligence Panel container via its header text
        panel_header = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//span[contains(text(), 'INTELLIGENCE PANEL')]")
            )
        )
        # Panel container is the grandparent of the header span
        panel_container = panel_header.find_element(By.XPATH, "../..")

        transform = panel_container.value_of_css_property("transform")

        # When open: translateX(0) / matrix(1,0,0,1,0,0)
        # When closed: translateX(100%) / matrix with large tx
        is_open = (
            "matrix" in transform
            and not transform.endswith("none")
        )

        # More reliable check: matrix tx component should be ~0 when open
        tx_zero = False
        if transform.startswith("matrix("):
            parts = transform.replace("matrix(", "").replace(")", "").split(",")
            tx = float(parts[4].strip())
            tx_zero = abs(tx) < 5  # near 0px = panel slid into view

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
        # The (i) button is a <button> containing the text "i"
        info_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='i']"))
        )
        info_button.click()
        time.sleep(0.5)  # popover render

        # Locate the popover containing "PROJECT INFO"
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
    print("(Render free tier may cold-start — first load can take up to 60s)\n")

    driver = get_driver()
    wait = WebDriverWait(driver, ELEMENT_TIMEOUT)

    try:
        test_visual_load(driver, wait)
        test_handshake(driver, wait)
        test_signature(driver, wait)
    finally:
        driver.quit()

    write_report()


if __name__ == "__main__":
    main()
