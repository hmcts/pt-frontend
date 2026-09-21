@JIRA-EPIC:HDPD-610
Feature: Indoor features

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

    @AC1 @JIRA-TEST-KEY:PTSD-851
    Scenario: Verify indoor features page content
        Given the citizen is on the Indoor Features page
        Then the indoor features page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-854
    Scenario: Verify Save and Continue with indoor feature details
        Given the citizen is on the Indoor Features page
        When the citizen enters indoor feature details
        And the citizen clicks Save and continue on the Indoor Features page
        Then the citizen is navigated to the Does the tenancy include any other facilities page

    @AC3 @JIRA-TEST-KEY:PTSD-854
    Scenario: Verify Save and Continue with blank indoor feature details
        Given the citizen is on the Indoor Features page
        When the citizen leaves the indoor features field blank
        And the citizen clicks Save and continue on the Indoor Features page
        Then the citizen is navigated to the Does the tenancy include any other facilities page

    @AC4 @JIRA-TEST-KEY:PTSD-855
    Scenario: Verify Save for Later
        Given the citizen is on the Indoor Features page
        When the citizen enters indoor feature details
        And the citizen clicks indoor features Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

