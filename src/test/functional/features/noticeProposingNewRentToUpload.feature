@JIRA-TEST-KEY:HDPD-579 @regression
Feature: Verify Notice proposing a new rent question page

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
        When I click "Landlord's notice proposing a new rent" link
        Then I check that the text "Do you have a landlord's notice proposing a new rent to upload?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-957
    Scenario: Page content

        Then I check that the text "Do you have a landlord's notice proposing a new rent to upload?" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-958
    Scenario: Conditional text area is displayed when No is selected

        When I select "No" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        Then I check that the text "Why can you not upload a notice proposing a new rent?" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-959
    Scenario: Navigate to upload notice page when Yes is selected

        When I select "Yes" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And  I click 'Save and continue'
        Then I check that the text "Upload your landlord’s notice proposing a new rent" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-960
    Scenario: Navigate to legal validity page when No is selected with reason

        When I select "No" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And I enter "Some document need to arrange" for the label "Why can you not upload a notice proposing a new rent?"
        And I click "Save and continue"
        Then I check that the text "Your notice proposing a new rent" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-961
    Scenario: Error when no option selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you have a notice proposing a new rent to upload" is displayed on the page


    @AC5 @JIRA-TEST-KEY:PTSD-961
    Scenario: Error when No selected and reason left blank

        When I select "No" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And I click "Save and continue"
        Then I check that the error message "Enter why you cannot upload a notice proposing a new rent" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-961
    Scenario: Error when reason is less than 2 characters

        When I select "No" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And I enter "a" for the label "Why can you not upload a notice proposing a new rent?"
        And I click "Save and continue"
        Then I check that the error message "Your reasons why must be 2 characters or more" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-961
    Scenario: Error when reason exceeds 500 characters

        When I select "No" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And I enter characters more than "500" in the description field for the question "Why can you not upload a notice proposing a new rent?"
        And I click "Save and continue"
        Then I check that the error message "Your reasons why must be 500 characters or less" is displayed on the page