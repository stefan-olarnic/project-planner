from behave import *

from automation.pom.dashboard_page.DashboardPage import DashboardPage

@step('User clicks on Create project button from dashboard')
def step_click_create_project(context):
    context.dashboard_page = DashboardPage(context.page)
    context.dashboard_page.click_create_project()

