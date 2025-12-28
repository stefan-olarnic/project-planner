import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))


def before_all(context):
    """Setup executed before all tests"""
    context.playwright = sync_playwright().start()
    context.browser_type = context.playwright.chromium


def before_scenario(context, scenario):
    """Setup executed before each scenario"""
    # Launch browser
    context.browser = context.browser_type.launch(
        headless=False,  # Set to True to run in headless mode
        slow_mo=500      # Slow down by 500ms - remove this for faster execution
    )
    
    # Create a new browser context and page
    context.context_browser = context.browser.new_context(
        viewport={'width': 1920, 'height': 1080}
    )
    context.page = context.context_browser.new_page()


def after_scenario(context, scenario):
    """Cleanup executed after each scenario"""
    # Take screenshot before closing - use absolute path
    screenshots_dir = Path(__file__).parent / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = screenshots_dir / f"{scenario.name.replace(' ', '_')}.png"
    context.page.screenshot(path=str(screenshot_path))
    print(f"Screenshot saved: {screenshot_path}")
    
    if hasattr(context, 'context_browser'):
        context.context_browser.close()
    if hasattr(context, 'browser'):
        context.browser.close()


def after_all(context):
    """Cleanup executed after all tests"""
    if hasattr(context, 'playwright'):
        context.playwright.stop()
