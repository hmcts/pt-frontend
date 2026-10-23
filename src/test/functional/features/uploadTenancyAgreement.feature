@JIRA-TEST-KEY:HDPD-588 @regression @WIP

Feature: Verify Upload tenancy agreement page


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
        When I click "Your tenancy agreement" link
        Then I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        When I select "Yes" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I click 'Save and continue'
        Then I check that the text "Upload tenancy agreement" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-881
    Scenario: Page content

        Then I check that the text "Upload a file" is displayed on the page



    @AC2 @JIRA-TEST-KEY:PTSD-882 @AC3 @JIRA-TEST-KEY:PTSD-883
    Scenario: Save and continue

        When I upload "supported-file"
        And  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-884
    Scenario: Save for later

        When I upload "supported-file"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-885
    Scenario: No file selected validation

        When  I click 'Save and continue'
        Then I check that the error message "Select a file to upload" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-885
    Scenario: No file selected validation

        When I upload "empty-file"
        Then I check that the error message "The selected file is empty" is displayed on the page


    @AC7 @JIRA-TEST-KEY:PTSD-885
    Scenario: No file selected validation

        When I upload "password-file"
        Then I check that the error message "The selected file is password protected" is displayed on the page