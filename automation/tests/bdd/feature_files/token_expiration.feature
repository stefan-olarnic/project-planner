@security @token
Feature: Token expiration and session management

  @critical
  Scenario: Access dashboard without valid token should redirect to login
    Given User navigates directly to dashboard without login
    Then User should be redirected to login page

  @critical
  Scenario: Access dashboard with expired/cleared token
    Given User is logged in successfully with "admin" and "1234"
    And User token is cleared/expired
    When User tries to access dashboard
    Then User should be redirected to login page
