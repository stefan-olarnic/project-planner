from behave import *

from automation.pom.login_page.LoginPage import LoginPage

@given("I open the login page")
def step_open_login(context):
    context.login_page = LoginPage(context.page)
    context.login_page.open()

@when('I login with "{username}" and "{password}"')
def step_login(context, username, password):
    context.login_page.login(username, password)

@then("I should see the dashboard")
def step_verify_dashboard(context):
    # Wait for navigation and verify dashboard URL or element
    context.page.wait_for_url("**/dashboard.html", timeout=5000)
    assert "dashboard" in context.page.url
