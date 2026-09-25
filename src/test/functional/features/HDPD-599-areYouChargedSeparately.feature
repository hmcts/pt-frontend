@JIRA-EPIC:HDPD-599
Feature: Are you charged separately for anything else?

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

    @AC1 @JIRA-TEST-KEY:PTSD-838
    Scenario: AC1 - Page content
        Given the citizen is on the Are You Charged Separately page
        Then the page displays the correct content

    @AC2 @JIRA-TEST-KEY:PTSD-839
    Scenario: AC2 - Save and continue with Yes selected
        Given the citizen is on the Are You Charged Separately page
        When the citizen selects Yes
        And the citizen clicks Save and continue
        Then the citizen is taken to the next page

    @AC3 @JIRA-TEST-KEY:PTSD-840
    Scenario: AC3 - Save and continue with No selected
        Given the citizen is on the Are You Charged Separately page
        When the citizen selects No
        And the citizen clicks Save and continue
        Then the citizen is taken to the current rent and other costs page

    @AC4 @JIRA-TEST-KEY:PTSD-841
    Scenario: AC4 - Validation error
        Given the citizen is on the Are You Charged Separately page
        When the citizen clicks Save and continue without selecting an option
        Then the validation error is displayed
        And the citizen remains on the same page