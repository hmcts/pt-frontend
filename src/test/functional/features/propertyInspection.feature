@JIRA-EPIC:HDPD-621 @regression

Feature: Validate Property Inspection Page

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


    @AC1 @JIRA-TEST-KEY:PTSD-867
    Scenario:  Page content
        Given the citizen is on the Property Inspection page
        Then the Property Inspection page content is displayed

    @AC2 @JIRA-TEST-KEY:PTSD-868
    Scenario: Conditional reveal when No is selected
        Given the citizen is on the Property Inspection page
        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        Then the inspection reason field is revealed

    @AC3 @JIRA-TEST-KEY:PTSD-868
    Scenario: Reason field is mandatory when No is selected
        Given the citizen is on the Property Inspection page
        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I click "Save and continue"
        Then I check that the error message "Enter why you think an inspection is needed" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-869
    Scenario: Save and continue with Yes selected
        Given the citizen is on the Property Inspection page
        When I select "Yes" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I click "Save and continue"
        Then the citizen is taken to the Hearing page

    @AC5 @JIRA-TEST-KEY:PTSD-869
    Scenario: Save and continue with No selected and reason entered
        Given the citizen is on the Property Inspection page
        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And the citizen enters an inspection reason
        And I click "Save and continue"
        Then the citizen is taken to the Hearing page


    @AC6 @JIRA-TEST-KEY:PTSD-870
    Scenario: Error when no radio option selected
        Given the citizen is on the Property Inspection page
        When  I click "Save and continue"
        Then I check that the error message "Select yes if you agree to the tribunal making a decision without an inspection" is displayed on the page