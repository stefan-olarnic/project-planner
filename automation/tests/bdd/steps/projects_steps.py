from behave import *

from automation.pom.projects_page.ProjectsPage import ProjectsPage

@then('Projects page is displayed')
def step_verify_projects_page(context):
    context.projects_page = ProjectsPage(context.page)
    assert context.projects_page.is_loaded(), "Projects page did not load correctly"