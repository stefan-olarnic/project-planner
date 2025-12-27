from behave import *

from automation.pom.projects_page.ProjectsPage import ProjectsPage

@step('Projects page is displayed')
def step_verify_projects_page(context):
    context.projects_page = ProjectsPage(context.page)
    assert context.projects_page.is_loaded(), "Projects page did not load correctly"

@step('User creates a new project named "{project_name}"')
def step_create_new_project(context, project_name):
    projects_page: ProjectsPage = context.projects_page
    projects_page.create_project(project_name)
    print(f"Project '{project_name}' created.")

@then('The new project "{project_name}" is correctly listed in the projects page')
def step_verify_project_listed(context, project_name):
    projects_page: ProjectsPage = context.projects_page
    # Verify project exists in the Name column
    projects_page.verify_project_exists(project_name)
    print(f"✓ Project '{project_name}' is listed in projects table")

@then('The projects page should show {count:d} projects')
def step_verify_project_count(context, count):
    projects_page: ProjectsPage = context.projects_page
    actual_count = projects_page.get_project_count()
    assert actual_count == count, f"Expected {count} projects, but found {actual_count}"
    print(f"✓ Projects page shows {actual_count} project(s)")

@when('User tries to create a third project')
def step_try_create_project(context):
    projects_page: ProjectsPage = context.projects_page
    projects_page.try_create_project_at_limit()

@then('Plan limit modal is displayed')
def step_verify_limit_modal(context):
    projects_page: ProjectsPage = context.projects_page
    projects_page.verify_limit_modal_displayed()
    print("✓ Plan limit modal is displayed")

@then('Limit modal shows message "{expected_message}"')
def step_verify_limit_message(context, expected_message):
    projects_page: ProjectsPage = context.projects_page
    actual_message = projects_page.get_limit_modal_message()
    assert actual_message == expected_message, \
        f"Expected message '{expected_message}', got '{actual_message}'"
    print(f"✓ Modal message verified: '{actual_message}'")

@then('Upgrade button is visible in the modal')
def step_verify_upgrade_button(context):
    projects_page: ProjectsPage = context.projects_page
    projects_page.verify_upgrade_button_visible()
    print("✓ Upgrade button is visible")

@step('User creates projects up to the PRO plan limit')
def step_create_projects_to_pro_limit(context):
    projects_page: ProjectsPage = context.projects_page
    current_count = projects_page.get_project_count()
    pro_limit = 10  # Pro plan allows 10 projects
    for i in range(current_count + 1, pro_limit + 1):
        project_name = f"Pro Project {i}"
        projects_page.create_project(project_name)
        print(f"Project '{project_name}' created.")    