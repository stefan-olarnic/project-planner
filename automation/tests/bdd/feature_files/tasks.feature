@tasks
Feature: Creating and managing tasks within projects

  Background:
    Given User login with "admin" and "1234"
    When User navigates to the project "Project One"
    Then Project "Project One" page is displayed

  @smoke @task_creation
  Scenario: Creating a new task in a project
    When User clicks on "Add Task" button
    And User creates a new task named "Task One" with description "This is the first task."
    Then The new task "Task One" is correctly listed in the tasks list of project "Project One"

  @task_completion
  Scenario: Marking a task as completed
    Given User clicks on "Add Task" button
    And User creates a new task named "Task One" with description "This is the first task."
    When User marks the task "Task One" as completed
    Then The task "Task One" should be shown as completed in the tasks list

  @task_deletion
  Scenario: Deleting a task from a project
    Given User clicks on "Add Task" button
    And User creates a new task named "Task One" with description "This is the first task."
    When User deletes the task "Task One"
    Then The task "Task One" should no longer be listed in the tasks list of project "Project One"