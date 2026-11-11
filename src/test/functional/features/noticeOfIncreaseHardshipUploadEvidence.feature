@JIRA-TEST-KEY:HDPD-585 @regression @WIP
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
        When I select "Yes" for the question "Do you think the notice is legally valid?"
        And  I click 'Save and continue'
        Then I check that the text "Hardship" is displayed on the page
        When I select "Yes" for the question "Will a rent increase on the proposed start date cause you hardship?"
        And  I click 'Save and continue'
        Then I check that the text "Upload your supporting evidence for how you would experience hardship (optional)" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-1019
    Scenario: Page content

        Then I check that the text "Include any documents and evidence that you think are relevant to show your financial situation and how you would experience hardship, such as bank statements and outgoings." is displayed on the page
        And I check that the text "Upload a file" is displayed on the page
        And the field "No file chosen" is "displayed"


    @AC2 @JIRA-TEST-KEY:PTSD-1020
    Scenario: Select suported file then label mo file selection is not displayed

        When I upload "supported-file"
        And  I click 'Save and continue'
        And the field "No file chosen" is "not displayed"

    @AC3 @JIRA-TEST-KEY:PTSD-1021
    Scenario: Select supproted file and click on save and continue button

        When I upload "supported-file"
        And  I click 'Save and continue'
        And I check that the text "Check your answers" is displayed on the page


    @AC4 @JIRA-TEST-KEY:PTSD-1022
    Scenario: No file selected and click on save and continue button

        When  I click 'Save and continue'
        And I check that the text "Check your answers" is displayed on the page


    @AC5 @JIRA-TEST-KEY:PTSD-1023
    Scenario: No file selected and click on save and continue button

        When  I click 'Save for later'
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-1025
    Scenario: Empty file selection

        When I upload "empty-file"
        Then I check that the error message "The selected file is empty" is displayed on the page


    @AC6 @JIRA-TEST-KEY:PTSD-1025
    Scenario: Password protected file

        When I upload "password-file"
        Then I check that the error message "The selected file is password protected" is displayed on the page