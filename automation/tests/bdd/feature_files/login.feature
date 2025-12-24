@login @smoke
Feature: Login functionality

  @positive @critical
  Scenario: Check that user can successfully login with valid credentials
    Given User open application on login page
    When User login with "admin" and "1234"
    Then Dashboard page is displayed

  @negative
  Scenario Outline: Failed login with invalid credentials
    Given User open application on login page
    When User login with "<username>" and "<password>"
    Then Error message "<expected_message>" is displayed

    Examples:
      | username | password | expected_message              |
      | None     | None     | Username or email incorrect.  |
      | admin    | None     | Incorrect password.           |
      | test12345| test123  | Username or email incorrect.  |
      | None     | 1234     | Username or email incorrect.  |


# Scenario Outline: Multiple login tests
#   When User login with "<username>" and "<password>"
#   Then Dashboard page is displayed
  
#   Examples:
#     | username | password |
#     | admin    | 1234     |
#     | user1    | pass1    |
#     | test     | test123  |