@JIRA-EPIC:HDPD-605 @regression

Feature: Validate Property address Page

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

    @AC1 @JIRA-TEST-KEY:PTSD-842
    Scenario: Verify property address page content
        Given the citizen is on the Property Address page
        Then the property address page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-843
    Scenario: Verify Save and Continue with valid mandatory fields
        Given the citizen is on the Property Address page
        When the citizen enters valid mandatory property address details
        And I click "Save and continue"
        Then the citizen is navigated to the What are you renting page


    @AC3 @JIRA-TEST-KEY:PTSD-844
    Scenario: Verify Save for Later
        Given the citizen is on the Property Address page
        When the citizen enters valid mandatory property address details
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC4 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify citizen can continue with optional fields left blank
        Given the citizen is on the Property Address page
        When the citizen enters valid mandatory property address details
        And I click "Save and continue"
        Then the citizen is navigated to the What are you renting page
        Then the citizen is navigated to the What are you renting page


    @AC5 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify validation when mandatory fields are empty
        Given the citizen is on the Property Address page
        And I click "Save and continue"
        Then I check that the error message "Enter address line 1" is displayed on the page
        Then I check that the error message "Enter town or city" is displayed on the page
        Then I check that the error message "Enter postcode" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify validation when postcode is invalid
        Given the citizen is on the Property Address page
        When the citizen enters an invalid postcode
        And I click "Save and continue"
        Then I check that the error message "Enter a valid postcode" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Address Line 1 minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters an Address Line 1 value less than 2 characters
        And I click "Save and continue"
        Then I check that the error message "Address line 1 must be 2 characters or more" is displayed on the page

    @AC8 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Address Line 2 minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters an Address Line 2 value less than 2 characters
        And I click "Save and continue"
        Then I check that the error message "Address line 2 must be 2 characters or more" is displayed on the page

    @AC9 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Town or City minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters a Town or City value less than 2 characters
        And I click "Save and continue"
        Then I check that the error message "Town or city must be 2 characters or more" is displayed on the page


    @AC10 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify County minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters a County value less than 2 characters
        And I click "Save and continue"
        Then I check that the error message "County must be 2 characters or more" is displayed on the page