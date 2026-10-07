@JIRA-TEST-KEY:HDPD-588 @regression

Feature: Your information

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
        Given the citizen is on the Your information page

    @AC1 @JIRA-TEST-KEY:PTSD-919
    Scenario: Verify page content
        Then the page displays the heading "Your information"
        And the following fields are displayed:
            | First name                         |
            | Last name                          |
            | Company name (optional)            |
            | Reference number for communication |
        And the reference number hint text "For example, AB123" is displayed
        And the buttons "Save and continue" and "Save and add to tasklist" are displayed

    @AC2 @JIRA-TEST-KEY:PTSD-920
    Scenario: Verify First Name pre-population
        Then the First name field is pre-populated from IDAM
        And the First name field remains editable

    @AC3 @JIRA-TEST-KEY:PTSD-921
    Scenario: Verify Last Name pre-population
        Then the Last name field is pre-populated from IDAM
        And the Last name field remains editable

    @AC4 @JIRA-TEST-KEY:PTSD-922
    Scenario: Save and continue with valid mandatory fields
        When the citizen enters valid values in mandatory fields
        And the citizen clicks "Save and continue"
        Then the details are saved successfully
        And the citizen is redirected to the "Check your answers" page

    @AC5 @JIRA-TEST-KEY:PTSD-923
    Scenario: Optional fields left blank
        When the citizen enters valid values in mandatory fields only
        And leaves Company name and Reference number blank
        And the citizen clicks "Save and continue"
        Then the application accepts the submission
        And no validation errors are displayed

    @AC6 @JIRA-TEST-KEY:PTSD-924
    Scenario Outline: Mandatory field validation errors
        When the citizen enters "<firstName>" in First name
        And the citizen enters "<lastName>" in Last name
        And the citizen clicks "Save and continue"
        Then the error message "<errorMessage>" is displayed
        And the citizen remains on the Your information page

        Examples:
            | firstName                                                                                                     | lastName                                                                                                  | errorMessage                                                                                                |
            |                                                                                                               | Smith                                                                                                     | Enter a first name                                                                                          |
            | John                                                                                                          |                                                                                                           | Enter a last name                                                                                           |
            | John123                                                                                                       | Smith                                                                                                     | First name must only include letters a to z, and special characters such as hyphens, spaces and apostrophes |
            | John                                                                                                          | Smith123                                                                                                  | Last name must only include letters a to z, and special characters such as hyphens, spaces and apostrophes  |
            | AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Smith                                                                                                     | First name must be 100 characters or less                                                                   |
            | John                                                                                                          | BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB | Last name must be 100 characters or less                                                                    |