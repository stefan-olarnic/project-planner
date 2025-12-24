from behave import *

from automation.pom.login_page.LoginPage import LoginPage

@given("User navigates directly to dashboard without login")
def step_navigate_to_dashboard_without_login(context):
    # Navigate to login page first to clear storage
    context.page.goto("http://localhost:8000/project-planner/login.html")
    # Clear any existing auth data
    context.page.context.clear_cookies()
    context.page.evaluate("() => localStorage.clear()")
    # Now try to access dashboard directly without login
    context.page.goto("http://localhost:8000/project-planner/dashboard.html")

@then("User should be redirected to login page")
def step_verify_redirect_to_login(context):
    # Verify redirect happened
    context.page.wait_for_url("**/login.html", timeout=3000)
    assert "login.html" in context.page.url, f"Expected login.html but got {context.page.url}"
    print(f"Successfully redirected to: {context.page.url}")

@given('User is logged in successfully with "{username}" and "{password}"')
def step_user_logged_in(context, username, password):
    context.login_page = LoginPage(context.page)
    context.login_page.open_app()
    context.login_page.login(username, password)
    # Wait for dashboard
    context.page.wait_for_url("**/dashboard.html", timeout=5000)
    assert "dashboard" in context.page.url

@given("User token is cleared/expired")
def step_clear_token(context):
    # Simulate token expiration by clearing localStorage
    context.page.evaluate("() => localStorage.removeItem('loggedInUser')")
    print("Token cleared from localStorage")

@when("User tries to access dashboard")
def step_try_access_dashboard(context):
    # Refresh page or navigate to dashboard
    context.page.goto("http://localhost:8000/project-planner/dashboard.html")
