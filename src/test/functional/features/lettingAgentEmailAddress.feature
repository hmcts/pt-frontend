@JIRA-EPIC:HDPD-1003 @regression

Feature: Validate Enter and validate the letting agent's email address page

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

    @AC1-1003 @JIRA-TEST-KEY:PTSD-878
    Scenario:Verify page content for the Letting Agent Email Address page
        Given the citizen is on the letting agent's email address page

    @AC2 @JIRA-TEST-KEY:PTSD-879
    Scenario:Citizen enters a valid letting agent email address and continues successfully
        Given the citizen is on the letting agent's email address page
        When the citizen enters a valid email address
        And I click "Save and continue"
        Then the citizen is taken to the letting agent's phone number page

    @AC3 @JIRA-TEST-KEY:PTSD-880
    Scenario: Citizen attempts to continue without entering a letting agent email address
        Given the citizen is on the letting agent's email address page
        When the citizen leaves the email field blank
        And I click "Save and continue"
        Then I check that the error message "This field is required" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-880
    Scenario:  Citizen enters an incorrectly formatted letting agent email address
        Given the citizen is on the letting agent's email address page
        When the citizen enters an invalid email address
        And I click "Save and continue"
        Then I check that the error message "Enter an email address in the correct format, like name@example.com" is displayed on the page