@JIRA-EPIC:HDPD-611 @regression
Feature: Validate Does the tenancy include any other facilities page

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

    @AC1 @JIRA-TEST-KEY:PTSD-909
    Scenario: AC1 Verify page content

        Given the citizen is on the Other Facilities page
        Then the page displays all expected content for Other Facilities page

    @AC2 @JIRA-TEST-KEY:PTSD-910
    Scenario: AC2 Verify conditional reveal when Yes is selected

        Given the citizen is on the Other Facilities page
        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        Then the What other facilities does your tenancy include text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-911
    Scenario: AC3 Verify Save and Continue with Yes selected

        Given the citizen is on the Other Facilities page
        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And the citizen enters facilities details
        And I click "Save and continue"
        Then the citizen is navigated to the Do you share the property with the landlord page

    @AC4 @JIRA-TEST-KEY:PTSD-911
    Scenario: AC3 Verify Save and Continue with No selected
        Given the citizen is on the Other Facilities page
        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        Then the citizen is navigated to the Do you share the property with the landlord page

    @AC5 @JIRA-TEST-KEY:PTSD-912
    Scenario: AC4 Verify Save for Later

        Given the citizen is on the Other Facilities page
        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And the citizen enters facilities details
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-913
    Scenario: AC5 Verify validation when Yes selected and details not entered

        Given the citizen is on the Other Facilities page
        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        Then I check that the error message "Enter what other facilities your tenancy includes" is displayed on the page