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

@then('The new project "{project_name}" should be listed in the projects page')
def step_verify_project_listed(context, project_name):
    projects_page: ProjectsPage = context.projects_page
    # Verify project exists in the Name column
    projects_page.verify_project_exists(project_name)
    print(f"✓ Project '{project_name}' is listed in projects table")