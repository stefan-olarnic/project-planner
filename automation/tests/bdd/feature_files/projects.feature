@projects
Feature: Creating and managing projects

  @smoke @limit @critical
  Scenario: Free user project creation flow - from first to limit
    Given User login with "admin" and "1234"
    Then User has FREE plan displayed on dashboard
    When User clicks on Create project button from dashboard
    Then Projects page is displayed
    
    # Create first project
    And User creates a new project named "Project One"
    Then The new project "Project One" is correctly listed in the projects page
    And The projects page should show 1 projects
    
    # Create second project (should work)
    And User creates a new project named "Project Two"
    Then The new project "Project Two" is correctly listed in the projects page
    And The projects page should show 2 projects
    
    # Try to create third project (should be blocked)
    When User tries to create a third project
    Then Plan limit modal is displayed
    And Limit modal shows message "You have reached the plan limit FREE: 2 / 2 projects. Upgrade for more."
    And Upgrade button is visible in the modal


  @pro @limit
  Scenario: Pro user can create multiple projects beyond free limit
    Given User login with "prouser" and "abcd"
    Then User has PRO plan displayed on dashboard
    When User clicks on Create project button from dashboard
    Then Projects page is displayed
    And User creates projects up to the PRO plan limit
    Then The projects page should show 10 projects