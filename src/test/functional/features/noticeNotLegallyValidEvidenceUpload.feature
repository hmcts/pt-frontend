@JIRA-TEST-KEY:HDPD-583 @regression
Feature: Verify Notice proposing a new rent question page

    Background:
        And the user has successfully logged on to market-rent-determination application
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Landlord's notice proposing a new rent" link
        Then I check that the text "Do you have a landlord's notice proposing a new rent to upload?" is displayed on the page
        When I select "Yes" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And I click "Save and continue"
        Then I check that the text "Upload your landlord’s notice proposing a new rent" is displayed on the page
        When I upload "supported-file"
        And  I click 'Save and continue'
        Then I check that the text "Your notice proposing a new rent" is displayed on the page
        When I select "No" for the question "Do you think the notice is legally valid?"
        And  I click 'Save and continue'
        Then I check that the text "Upload evidence to show why you think the notice is not legally valid (optional)" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-997 @AC2 @JIRA-TEST-KEY:PTSD-998
    Scenario: Page content

        Then I check that the text "If you are taking a picture of a document, put the document on a flat surface and take the picture from above." is displayed on the page


    @AC3 @JIRA-TEST-KEY:PTSD-999
    Scenario: Select suported file and click on save and continue buttom

        When I upload "supported-file"
        And  I click 'Save and continue'
        Then I check that the text "Hardship" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-1000
    Scenario: Click on save and continue button without selecting file

        When  I click 'Save and continue'
        Then I check that the text "Hardship" is displayed on the page


    @AC5 @JIRA-TEST-KEY:PTSD-1001
    Scenario: No file selected validation

        When I upload "empty-file"
        Then I check that the error message "The selected file is empty" is displayed on the page


    @AC6 @JIRA-TEST-KEY:PTSD-1001
    Scenario: Password protected file selected validation

        When I upload "password-file"
        Then I check that the error message "The selected file is password protected" is displayed on the page

