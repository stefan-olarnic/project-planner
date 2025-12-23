@login @smoke
Feature: Login functionality

  @positive @critical
  Scenario: Successful login
    Given I open the login page
    When I login with "user1" and "password123"
    Then I should see the dashboard

  @negative
  Scenario: Failed login with invalid credentials
    Given I open the login page
    When I login with "invalid_user" and "wrong_password"
    # Then I should see an error message
