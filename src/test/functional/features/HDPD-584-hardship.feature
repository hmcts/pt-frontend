@JIRA-EPIC:HDPD-584
Feature: Would a rent increase on the proposed start date cause you hardship?

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

    @AC1 @JIRA-TEST-KEY:PTSD-846
    Scenario: Verify page content
        Given the citizen is on the Hardship page
        Then the citizen sees the hardship page heading
        And the citizen sees hardship radio buttons
        And the citizen sees hardship action buttons

    @AC2 @JIRA-TEST-KEY:PTSD-847
    Scenario: Verify Save and Continue with Yes selected
        Given the citizen is on the Hardship page
        When the citizen selects Yes for hardship
        And the citizen clicks hardship Save and continue
        Then the citizen is navigated to the Upload Supporting Evidence page

    @AC3 @JIRA-TEST-KEY:PTSD-847
    Scenario: Verify Save and Continue with No selected
        Given the citizen is on the Hardship page
        When the citizen selects No for hardship
        And the citizen clicks hardship Save and continue
        Then the citizen is navigated to the Check your answers page

    @AC4 @JIRA-TEST-KEY:PTSD-848
    Scenario: Verify Save for Later
        Given the citizen is on the Hardship page
        When the citizen selects Yes for hardship
        And the citizen clicks hardship Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-849
    Scenario: Verify validation when no radio button is selected
        Given the citizen is on the Hardship page
        When the citizen clicks hardship Save and continue
        Then the citizen sees the hardship validation error
        And the citizen remains on the Hardship page