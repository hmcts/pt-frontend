@JIRA-EPIC:HDPD-605
Feature: Property address

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
        And the citizen clicks property address Save and continue
        Then the citizen is navigated to the What are you renting page


    @AC3 @JIRA-TEST-KEY:PTSD-844
    Scenario: Verify Save for Later
        Given the citizen is on the Property Address page
        When the citizen enters valid mandatory property address details
        And the citizen clicks property address Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC4 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify citizen can continue with optional fields left blank
        Given the citizen is on the Property Address page
        When the citizen enters valid mandatory property address details
        And the citizen leaves optional property address fields blank
        And the citizen clicks property address Save and continue
        Then the citizen is navigated to the What are you renting page
        And no optional field validation errors are displayed

    @AC5 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify validation when mandatory fields are empty
        Given the citizen is on the Property Address page
        When the citizen clicks property address Save and continue
        Then the citizen sees the property address mandatory field validation errors

    @AC6 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify validation when postcode is invalid
        Given the citizen is on the Property Address page
        When the citizen enters an invalid postcode
        And the citizen clicks property address Save and continue
        Then the citizen sees the invalid postcode validation error

    @AC7 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Address Line 1 minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters an Address Line 1 value less than 2 characters
        And the citizen clicks property address Save and continue
        Then the citizen sees the Address Line 1 minimum length validation error

    @AC8 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Address Line 2 minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters an Address Line 2 value less than 2 characters
        And the citizen clicks property address Save and continue
        Then the citizen sees the Address Line 2 minimum length validation error

    @AC9 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify Town or City minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters a Town or City value less than 2 characters
        And the citizen clicks property address Save and continue
        Then the citizen sees the Town or City minimum length validation error

    @AC10 @JIRA-TEST-KEY:PTSD-845
    Scenario: Verify County minimum length validation
        Given the citizen is on the Property Address page
        When the citizen enters a County value less than 2 characters
        And the citizen clicks property address Save and continue
        Then the citizen sees the County minimum length validation error