@JIRA-EPIC:HDPD-600
Feature: Do the charges you pay for these services vary?

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

    @AC1 @JIRA-TEST-KEY:PTSD-831
    Scenario: Verify page load content
        Given the citizen is on the Charges Vary page
        Then the citizen sees the page heading
        And the citizen sees the hint text
        And the citizen sees Yes and No radio buttons
        And the citizen sees Save and continue and Save for later buttons

    @AC2 @JIRA-TEST-KEY:PTSD-832
    Scenario: Verify conditional reveal when Yes is selected
        Given the citizen is on the Charges Vary page
        When the citizen selects Yes for charges vary
        Then the variation details text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-834
    Scenario: Verify save and continue with Yes and details
        Given the citizen is on the Charges Vary page
        When the citizen selects Yes for charges vary
        And the citizen enters charges variation details
        And the citizen clicks charges vary Save and continue
        Then the citizen is navigated to the next page

    @AC4 @JIRA-TEST-KEY:PTSD-835
    Scenario: Verify save and continue with No selected
        Given the citizen is on the Charges Vary page
        When the citizen selects No for charges vary
        And the citizen clicks charges vary Save and continue
        Then the citizen is navigated to the next page

    @AC5 @JIRA-TEST-KEY:PTSD-836
    Scenario: Verify Save for Later
        Given the citizen is on the Charges Vary page
        When the citizen selects Yes for charges vary
        And the citizen enters charges variation details
        And the citizen clicks charges vary Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when no radio option selected
        Given the citizen is on the Charges Vary page
        When the citizen clicks charges vary Save and continue
        Then the citizen sees the charges vary radio button validation error

    @AC7 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when Yes selected and details blank
        Given the citizen is on the Charges Vary page
        When the citizen selects Yes for charges vary
        And the citizen leaves the variation details blank
        And the citizen clicks charges vary Save and continue
        Then the citizen sees the variation details required error

    @AC8 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when more than 500 characters entered
        Given the citizen is on the Charges Vary page
        When the citizen selects Yes for charges vary
        And the citizen enters more than 500 characters
        And the citizen clicks charges vary Save and continue
        Then the citizen sees the 500 character validation error