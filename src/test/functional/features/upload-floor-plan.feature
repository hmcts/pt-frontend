@JIRA-TEST-KEY:HDPD-609 @regression

Feature: Upload floor plan of the property

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
        Given the citizen is on the Upload floor plan page


    Scenario: AC1 - Verify page content
        Then the page displays the heading "Upload a floor plan of the property"
        And the hint text "If you are taking a picture of a document, put the document on a flat surface and the picture from above." is displayed
        And the upload component is displayed
        And the buttons "Save and continue" and "Save for later" are displayed


    Scenario: AC2 - Verify file selection
        When the citizen uploads a valid floor plan file
        Then the selected file name is displayed


    Scenario: AC3 - Save and continue with valid file
        Given the citizen uploads a valid floor plan file
        When the citizen clicks "Save and continue"
        Then the file is uploaded successfully
        And the citizen is redirected to the "Indoor features" page

    Scenario: AC4 - Save for later
        Given the citizen uploads a valid floor plan file
        When I click "Save for later"
        Then the selected file is saved in session
        And check that the user is redirected to the task-list citizen dashboard page

    Scenario Outline: AC6 - Validation errors
        When the citizen uploads "<fileType>"
        And the citizen clicks "Save and continue"
        Then the error message "<errorMessage>" is displayed

        Examples:
            | fileType         | errorMessage                                    |
            | no-file          | Select a floor plan of the property to upload   |
            | empty-file       | The selected file is empty                      |
            | unsupported-file | The selected file must be a [TBC list of types] |
            | oversized-file   | The selected file must be smaller than 25MB     |
            | virus-file       | The selected file contains a virus              |
            | password-file    | The selected file is password protected         |