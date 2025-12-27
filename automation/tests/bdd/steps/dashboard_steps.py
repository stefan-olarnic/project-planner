from behave import *

from automation.pom.dashboard_page.DashboardPage import DashboardPage

@step('User clicks on Create project button from dashboard')
def step_click_create_project(context):
    context.dashboard_page = DashboardPage(context.page)
    context.dashboard_page.click_create_project()

@then('User has FREE plan displayed on dashboard')
def step_verify_free_plan(context):
    dashboard_page = DashboardPage(context.page)
    dashboard_page.verify_user_has_free_plan()

@then('User has PRO plan displayed on dashboard')
def step_verify_pro_plan(context):
    dashboard_page = DashboardPage(context.page)
    dashboard_page.verify_user_has_pro_plan()

