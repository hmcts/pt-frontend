@JIRA-EPIC:HDPD-625
Feature: Have you already applied for help with your application fee?

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

    @AC1 @JIRA-TEST-KEY:PTSD-860
    Scenario: Verify page content
        Given the citizen is on the Have you already applied for help with fees page
        Then the page content is displayed correctly

    @AC2 @JIRA-TEST-KEY:PTSD-861
    Scenario: Verify reference number field is revealed when Yes is selected
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen selects Yes
        Then the help with fees reference number field is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-862
    Scenario: Verify citizen can continue with valid reference number
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen selects Yes
        And enters a valid help with fees reference number
        And clicks Save and continue
        Then the citizen is taken to the Help with fees Check your answers page

   @AC4 @JIRA-TEST-KEY:PTSD-863
    Scenario: Verify citizen can continue when No is selected
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen selects No
        And clicks Save and continue
        Then the citizen is taken to the You need to apply for help with fees page

    @AC5 @JIRA-TEST-KEY:PTSD-864
    Scenario: Verify error when no option is selected
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen clicks Save and continue
        Then the citizen sees the help with fees selection error

    @AC6 @JIRA-TEST-KEY:PTSD-865
    Scenario: Verify error when reference number is blank
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen selects Yes
        And clicks Save and continue
        Then the citizen sees the help with fees reference number required error

    @AC7 @JIRA-TEST-KEY:PTSD-865
    Scenario: Verify error when invalid reference number is entered
        Given the citizen is on the Have you already applied for help with fees page
        When the citizen selects Yes
        And enters an invalid help with fees reference number
        And clicks Save and continue
        Then the citizen sees the help with fees reference number format error