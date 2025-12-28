"""
Step definitions for Tasks Management
"""
from behave import *
from automation.pom.tasks_page.TasksPage import TasksPage
from automation.pom.projects_page.ProjectsPage import ProjectsPage
from automation.pom.dashboard_page.DashboardPage import DashboardPage


@when('User navigates to the project "{project_name}"')
def step_navigate_to_project(context, project_name):
    """Navigate to a specific project - create if doesn't exist"""
    projects_page = ProjectsPage(context.page)
    context.dashboard_page = DashboardPage(context.page)

    context.dashboard_page.click_create_project()
    projects_page.navigate_to_project(project_name)
    context.tasks_page = TasksPage(context.page)
    print(f"✓ Navigated to project: {project_name}")


@then('Project "{project_name}" page is displayed')
def step_verify_project_page(context, project_name):
    """Verify project page is displayed"""
    tasks_page: TasksPage = context.tasks_page
    tasks_page.verify_project_page_displayed(project_name)
    print(f"✓ Project page '{project_name}' is displayed")


@given('User clicks on "Add Task" button')
@when('User clicks on "Add Task" button')
def step_click_add_task(context):
    """Click the Add Task button"""
    tasks_page: TasksPage = context.tasks_page
    tasks_page.click_add_task_button()
    print("✓ Clicked Add Task button")


@given('User creates a new task named "{task_name}" with description "{description}"')
@when('User creates a new task named "{task_name}" with description "{description}"')
def step_create_task_with_description(context, task_name, description):
    """Create a new task with title and description"""
    tasks_page: TasksPage = context.tasks_page
    tasks_page.create_task(task_name, description)
    print(f"✓ Created task: '{task_name}' with description: '{description}'")


@then('The new task "{task_name}" is correctly listed in the tasks list of project "{project_name}"')
def step_verify_task_in_list(context, task_name, project_name):
    """Verify task is listed in project's tasks list"""
    tasks_page: TasksPage = context.tasks_page
    tasks_page.verify_task_in_list(task_name)
    print(f"✓ Task '{task_name}' is listed in project '{project_name}'")


@when('User marks the task "{task_name}" as completed')
def step_mark_task_completed(context, task_name):
    """Mark a task as completed"""
    tasks_page: TasksPage = context.tasks_page
    success = tasks_page.mark_task_as_done(task_name)
    assert success, f"Could not mark task '{task_name}' as completed"
    print(f"✓ Marked task '{task_name}' as completed")


@then('The task "{task_name}" should be shown as completed in the tasks list')
def step_verify_task_completed(context, task_name):
    """Verify task is shown as completed"""
    tasks_page: TasksPage = context.tasks_page
    is_done = tasks_page.is_task_marked_as_done(task_name)
    assert is_done, f"Task '{task_name}' is not marked as completed"
    print(f"✓ Task '{task_name}' is shown as completed")


@when('User deletes the task "{task_name}"')
def step_delete_task(context, task_name):
    """Delete a specific task by name"""
    tasks_page: TasksPage = context.tasks_page
    success = tasks_page.delete_task_by_name(task_name)
    assert success, f"Could not delete task '{task_name}'"
    print(f"✓ Deleted task '{task_name}'")


@then('The task "{task_name}" should no longer be listed in the tasks list of project "{project_name}"')
def step_verify_task_not_in_list(context, task_name, project_name):
    """Verify task is no longer in the list"""
    tasks_page: TasksPage = context.tasks_page
    is_present = tasks_page.is_task_present(task_name)
    assert not is_present, f"Task '{task_name}' is still present in the list"
    print(f"✓ Task '{task_name}' is no longer in project '{project_name}'")

