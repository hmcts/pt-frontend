
@JIRA-TEST-KEY:PTSD-1012
Feature: My application page
  As a PT user
  I want to be authenticated to the PT upon entering my credentials in IDAM
  So that I can start my application.
 
  @JIRA-TEST-KEY:PTSD-1012 
  Scenario: Check that after signing in user lands on the 'my applications' page and user can navigate to the tenancy type page
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge the rent increase proposed in a landlord’s notice"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    And I select the option "Assured periodic tenancy"
    And I click "Continue"
    Then check that the user is redirected to the task-list citizen dashboard page

  @JIRA-TEST-KEY:PTSD-1012
  Scenario: Check that valid error message is displayed when user clicks on continue button without selecting any option in tenancy type page
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge the rent increase proposed in a landlord’s notice"
    And I click "Continue"
    And I click "Continue"
    Then I check that valid error message is displayed for the tenancy-type page
