@JIRA-EPIC:HDPD-582
Feature: Notice legally valid
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

    @AC1 @JIRA-TEST-KEY:PTSD-811
    Scenario: Navigate to Hardship page when Yes is selected
        Given the citizen is on the Notice Legally Valid page
        When the citizen selects Yes for notice validity
        And the citizen clicks Save and continue
        Then the citizen is taken to the Hardship page

    @AC2 @JIRA-TEST-KEY:PTSD-812
    Scenario: Display text area when No is selected
        Given the citizen is on the Notice Legally Valid page
        When the citizen selects No for notice validity
        Then the explanation text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-814
    Scenario: Navigate to Upload Evidence page when No is selected and explanation provided
        Given the citizen is on the Notice Legally Valid page
        When the citizen selects No for notice validity
        And the citizen enters details into the optional text area
        And the citizen clicks Save and continue
        Then the citizen is taken to the Upload Evidence page

    @AC4 @JIRA-TEST-KEY:PTSD-815
    Scenario: Navigate to Upload Evidence page when No is selected and explanation not provided
        Given the citizen is on the Notice Legally Valid page
        When the citizen selects No for notice validity
        And the citizen clicks Save and continue
        Then the citizen is taken to the Upload Evidence page

    @AC5 @JIRA-TEST-KEY:PTSD-817
    Scenario: Save for later
        Given the citizen is on the Notice Legally Valid page
        When the citizen clicks Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-820
    Scenario: Validation error when no option is selected
        Given the citizen is on the Notice Legally Valid page
        When the citizen clicks Save and continue without making a selection
        Then the notice validity validation error is displayed
        And the citizen remains on the Notice Legally Valid page