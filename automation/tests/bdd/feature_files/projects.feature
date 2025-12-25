@projects
Feature: Creating and managing projects

  Scenario: Project page is displayed and creating new project
    Given User login with "admin" and "1234"
    When User clicks on Create project button from dashboard
    Then Projects page is displayed
    And User creates a new project named "Test Project"
    Then The new project "Test Project" should be listed in the projects page

#   Scenario: Delete an existing project
#     Given User is logged in successfully with "admin" and "1234"
#     And A project named "Old Project" exists
#     When User deletes the project named "Old Project"
#     Then The project "Old Project" should no longer be listed in the projects page