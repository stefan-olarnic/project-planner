from behave import *

from automation.pom.login_page.LoginPage import LoginPage

@given("User open application on login page")
def step_open_login(context):
    context.login_page = LoginPage(context.page)
    context.login_page.open_app()

@step('User login with "{username}" and "{password}"')
def step_login(context, username, password):
    # Initialize login_page if not already set
    if not hasattr(context, 'login_page') or context.login_page is None:
        context.login_page = LoginPage(context.page)
        context.login_page.open_app()
    
    login_page: LoginPage = context.login_page
    login_page.login(username, password)
    print(context.page.url)

@then("Dashboard page is displayed")
def step_verify_dashboard(context):
    # Wait for navigation and verify dashboard URL or element
    context.page.wait_for_url("**/dashboard.html", timeout=5000)
    assert "dashboard" in context.page.url

@then('Error message "{expected_message}" is displayed')
def step_verify_error_message(context, expected_message):
    # Verify specific error message is displayed
    error_locator = context.page.locator(f"text={expected_message}")
    assert error_locator.is_visible(), f"Expected error message '{expected_message}' not found"
    print(f"Error message verified: {expected_message}")