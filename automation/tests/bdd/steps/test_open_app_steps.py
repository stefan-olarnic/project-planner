from playwright.sync_api import sync_playwright

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()

        # Deschide pagina de login
        page.goto("http://localhost:8000/login.html")
        page.wait_for_load_state("domcontentloaded")

        print(f"✅ Pe pagina de login: {page.title()}")

        # Completează login form (folosind data-unid)
        page.fill("[data-unid='login__username__input']", "admin")
        page.fill("[data-unid='login__password__input']", "1234")

        # Click login
        page.click("[data-unid='login__submit__button']")

        # Așteaptă redirect la dashboard
        page.wait_for_url("**/dashboard.html", timeout=5000)

        print(f"✅ Logat cu succes! URL: {page.url}")

        # Screenshot dashboard
        page.screenshot(path="screenshots/dashboard.png")

        browser.close()
