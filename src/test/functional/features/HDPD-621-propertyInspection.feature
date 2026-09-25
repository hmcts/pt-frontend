@JIRA-EPIC:HDPD-621
Feature: Property Inspection

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
    Scenario: AC1 - Page content
        Given the citizen is on the Property Inspection page
        Then the Property Inspection page content is displayed

    @AC2 @JIRA-TEST-KEY:PTSD-868
    Scenario: AC2 - Conditional reveal when No is selected
        Given the citizen is on the Property Inspection page
        When the citizen selects No on the Property Inspection page
        Then the inspection reason field is revealed

    @AC3 @JIRA-TEST-KEY:PTSD-868
    Scenario: AC2 - Reason field is mandatory when No is selected
        Given the citizen is on the Property Inspection page
        When the citizen selects No and leaves the inspection reason blank
        Then the inspection reason validation error is displayed
        And the citizen remains on the Property Inspection page

    @AC4 @JIRA-TEST-KEY:PTSD-869
    Scenario: AC3 - Save and continue with Yes selected
        Given the citizen is on the Property Inspection page
        When the citizen selects Yes on the Property Inspection page
        And the citizen clicks Save and continue on the Property Inspection page
        Then the citizen is taken to the Hearing page

    @AC5 @JIRA-TEST-KEY:PTSD-869
    Scenario: AC3 - Save and continue with No selected and reason entered
        Given the citizen is on the Property Inspection page
        When the citizen selects No on the Property Inspection page
        And the citizen enters an inspection reason
        And the citizen clicks Save and continue on the Property Inspection page
        Then the citizen is taken to the Hearing page


    @AC6 @JIRA-TEST-KEY:PTSD-870
    Scenario: AC5 - Error when no radio option selected
        Given the citizen is on the Property Inspection page
        When the citizen submits the Property Inspection page without selecting an option
        Then the property inspection radio button error is displayed
        And the citizen remains on the Property Inspection page

    @HDPD-621_7
    Scenario: AC5 - Error when No selected and reason not entered
        Given the citizen is on the Property Inspection page
        When the citizen selects No and leaves the inspection reason blank
        Then the inspection reason validation error is displayed
        And the citizen remains on the Property Inspection page