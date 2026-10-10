@JIRA-EPIC:HDPD-611
Feature: Does the tenancy include any other facilities

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

    @HDPD-611_1
    Scenario: AC1 Verify page content
        Given the citizen is on the Other Facilities page
        Then the page displays all expected content

    @HDPD-611_2
    Scenario: AC2 Verify conditional reveal when Yes is selected
        Given the citizen is on the Other Facilities page
        When the citizen selects the Yes radio button
        Then the What other facilities does your tenancy include text area is displayed


    Scenario: AC3 Verify Save and Continue with Yes selected
        Given the citizen is on the Other Facilities page
        When the citizen selects the Yes radio button
        And the citizen enters facilities details
        And the citizen clicks Save and continue
        Then the citizen is navigated to the Do you share the property with the landlord page

    @HDPD-611_3
    Scenario: AC3 Verify Save and Continue with No selected
        Given the citizen is on the Other Facilities page
        When the citizen selects the No radio button
        And the citizen clicks Save and continue
        Then the citizen is navigated to the Do you share the property with the landlord page

    @HDPD-611_4
    Scenario: AC4 Verify Save for Later

        Given the citizen is on the Other Facilities page
        When the citizen selects the Yes radio button
        And the citizen enters facilities details
        And the citizen clicks Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @HDPD-611_5
    Scenario: AC5 Verify validation when no radio button selected
        Given the citizen is on the Other Facilities page
        When the citizen clicks Save and continue
        Then the citizen sees the tenancy facilities radio button validation error

    @HDPD-611_6
    Scenario: AC5 Verify validation when Yes selected and details not entered

        Given the citizen is on the Other Facilities page
        When the citizen selects the Yes radio button
        And the citizen clicks Save and continue
        Then the citizen sees the tenancy facilities details validation error