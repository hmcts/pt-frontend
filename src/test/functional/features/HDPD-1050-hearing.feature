
@JIRA-EPIC:HDPD-1050
Feature: Hearing

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

    @AC1 @JIRA-TEST-KEY:PTSD-871
    Scenario: Verify hearing page content
        Given the citizen is on the Hearing page
        Then the hearing page content is displayed correctly

    @AC2 @JIRA-TEST-KEY:PTSD-872
    Scenario: Verify reason field is displayed when No is selected
        Given the citizen is on the Hearing page
        When the citizen selects No on the hearing page
        Then the hearing reason text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when Yes is selected
        Given the citizen is on the Hearing page
        When the citizen selects Yes on the hearing page
        And the citizen clicks hearing Save and continue
        Then the citizen is taken to the Check your answers page

    @AC4 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when No is selected with a reason
        Given the citizen is on the Hearing page
        When the citizen selects No on the hearing page
        And the citizen enters a hearing reason
        And the citizen clicks hearing Save and continue
        Then the citizen is taken to the Check your answers page


    @AC5 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when no option is selected
        Given the citizen is on the Hearing page
        When the citizen clicks hearing Save and continue
        Then the citizen sees the hearing selection validation error

    @AC6 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when No is selected without a reason
        Given the citizen is on the Hearing page
        When the citizen selects No on the hearing page
        And the citizen clicks hearing Save and continue
        Then the citizen sees the hearing reason validation error