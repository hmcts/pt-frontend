@JIRA-EPIC:HDPD-1003
Feature: Letting Agent Email Address

    Background:
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC1 @JIRA-TEST-KEY:PTSD-878
    Scenario: AC1 - Verify page content
        Given the citizen is on the letting agent's email address page
        Then the page displays the heading "Your letting agent's email address"

    @AC2 @JIRA-TEST-KEY:PTSD-879
    Scenario: AC2 - Valid email address entered
        Given the citizen is on the letting agent's email address page
        When the citizen enters a valid email address
        And the citizen clicks Save and continue
        Then the citizen is taken to the letting agent's phone number page

    @AC3 @JIRA-TEST-KEY:PTSD-879
    Scenario: AC2 - Blank email address
        Given the citizen is on the letting agent's email address page
        When the citizen leaves the email field blank
        And the citizen clicks Save and continue
        Then the citizen is taken to the letting agent's phone number page

    @AC4 @JIRA-TEST-KEY:PTSD-880
    Scenario: AC3 - Invalid email address
        Given the citizen is on the letting agent's email address page
        When the citizen enters an invalid email address
        And the citizen clicks Save and continue
        Then the email address validation error is displayed