@JIRA-EPIC:HDPD-599 @regression

Feature: Validate Are you charged separately for anything else? Page

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
    Scenario: Page content
        Given the citizen is on the Are You Charged Separately page
        Then the page content is displayed on the Are You Charged Separately page

    @AC2 @JIRA-TEST-KEY:PTSD-839
    Scenario: Save and continue with Yes selected
        Given the citizen is on the Are You Charged Separately page
        When I select "Yes" for the question "Are you charged separately for anything else?"
        And I click "Save and continue"
        Then the citizen is taken to the next page

    @AC3 @JIRA-TEST-KEY:PTSD-840
    Scenario: Save and continue with No selected
        Given the citizen is on the Are You Charged Separately page
        When I select "No" for the question "Are you charged separately for anything else?"
        And I click "Save and continue"
        Then the citizen is taken to the current rent and other costs page

    @AC4 @JIRA-TEST-KEY:PTSD-841
    Scenario: Validation error
        Given the citizen is on the Are You Charged Separately page
        When I click "Save and continue"
        Then the validation error is displayed
        And the citizen remains on the same page