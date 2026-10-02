
@JIRA-EPIC:HDPD-1050 @regression
Feature: Validate  Review and manage hearing information Page

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
        Given the citizen is on the Hearing page

    @AC1 @JIRA-TEST-KEY:PTSD-871
    Scenario: Verify page content on the Hearing Details page
        Then the hearing page content is displayed correctly

    @AC2 @JIRA-TEST-KEY:PTSD-872
    Scenario: Verify reason field is displayed when No is selected
        When the citizen selects No on the hearing page
        Then the hearing reason text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when Yes is selected
        When the citizen selects Yes on the hearing page
        And I click "Save and continue"
        Then the citizen is taken to the Check your answers page

    @AC4 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when No is selected with a reason
        When the citizen selects No on the hearing page
        And the citizen enters a hearing reason
        And I click "Save and continue"
        Then the citizen is taken to the Check your answers page


    @AC5 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when no option is selected
        When the citizen clicks hearing Save and continue
        Then I check that the error message "Select yes if you agree to the tribunal making a decision without a hearing" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when No is selected without a reason
        When the citizen selects No on the hearing page
        And I click "Save and continue"
        Then I check that the error message "Enter why you think a hearing is needed" is displayed on the page