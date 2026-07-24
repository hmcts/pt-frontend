@myapp
Feature: My application page
  As a PT user
  I want to be authenticated to the PT upon entering my credentials in IDAM
  So that I can start my application.

  Scenario: Check that after signing in user lands on the 'my applications' page and can navigate to the application type page
    Given the user navigates to PT url
    When the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page