@JIRA-EPIC:HDPD-548 @regression

Feature: Validate  Contact phone number Page

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

    @AC1 @JIRA-TEST-KEY:PTSD-798
    Scenario: Verify citizen can continue with a valid mobile number
        Given the citizen is on the Contact Phone Number page
        When the citizen enters a valid mobile phone number
        And I click "Save and continue"
        Then the citizen is navigated to the Check Your Answers page

    @AC2 @JIRA-TEST-KEY:PTSD-798
    Scenario: Verify citizen can continue with a valid landline number
        Given the citizen is on the Contact Phone Number page
        When the citizen enters a valid landline phone number
        And I click "Save and continue"
        Then the citizen is navigated to the Check Your Answers page

    @AC3 @JIRA-TEST-KEY:PTSD-798
    Scenario: Verify citizen can continue without entering a phone number
        Given the citizen is on the Contact Phone Number page
        When the citizen leaves the contact phone number blank
        And I click "Save and continue"
        Then the citizen is navigated to the Check Your Answers page

    @AC4 @JIRA-TEST-KEY:PTSD-799
    Scenario: Verify save for later with valid mobile number
        Given the citizen is on the Contact Phone Number page
        When the citizen enters a valid mobile phone number
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-799
    Scenario: Verify save for later with valid landline number
        Given the citizen is on the Contact Phone Number page
        When the citizen enters a valid landline phone number
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-799
    Scenario: Verify save for later with blank phone number
        Given the citizen is on the Contact Phone Number page
        When the citizen leaves the contact phone number blank
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC7 @JIRA-TEST-KEY:PTSD-800
    Scenario: Verify validation when invalid phone number is entered
        Given the citizen is on the Contact Phone Number page
        When the citizen enters an invalid phone number
        And I click "Save and continue"
        Then the citizen sees the phone number format validation error