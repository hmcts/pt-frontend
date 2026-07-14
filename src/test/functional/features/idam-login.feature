@idam @login
Feature: IDAM login to Property Tribunal
  As a PT user
  I want to be authenticated to the PT upon entering my credentials in IDAM
  So that I can progress any claims that I may be involved in

  @ac1
  Scenario: AC1 - User is redirected to IDAM when accessing PT
    Given a user wants to log in to PT
    When they enter the PT UI url
    Then they are redirected to the IDAM authentication page

  @ac2
  Scenario: AC2 - Successful login redirects back to PT
    Given the user has reached the IDAM authentication page
    When the user enters their credentials successfully
    Then the user will be redirected back to the PT UI

  @ac3
  Scenario: AC3 - Unsuccessful login shows an error
    Given the user has reached the IDAM authentication page
    When the user enters their credentials incorrectly
    Then IDAM will show an error page
