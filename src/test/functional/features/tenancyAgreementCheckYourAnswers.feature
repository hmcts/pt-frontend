
@JIRA-TEST-KEY:HDPD-589 @regression
Feature: Verify Tenancy Agreement Check Your Answers

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

    @AC1 @JIRA-TEST-KEY:PTSD-886
    Scenario: Verify page content and answer summary
        Given the citizen is on the check your answers page
        And the page displays the caption "Tenancy agreement"
        And the page displays the heading "Check your answers"
        And the summary list contains "Do you have a copy of your tenancy agreement to upload?"
        And the answer value displayed is "Yes"
        And a "Change" link is displayed for each row
        And the page displays "Complete this section" button
        And the page displays "Save for later" button

    @AC2 @JIRA-TEST-KEY:PTSD-887
    Scenario: Verify uploaded file row is displayed when Yes selected
        Given the citizen is on the Upload tenancy agreement page
        When the citizen uploads a valid tenancy agreement file
        And  I click 'Save and continue'
        Then the answer value displayed is "Yes"
        And the summary list contains "Upload tenancy agreement"
        And the uploaded file name "tenancy-agreement.pdf" is displayed
        Then a "Change" link is displayed for each row

    @AC3 @JIRA-TEST-KEY:PTSD-888
    Scenario: Verify reason row is displayed when No selected
        Given the citizen is on copy of tenacy agreement page
        When I select "No" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And  I click 'Save and continue'
        Then the answer value displayed is "No"
        And the summary list contains "Why can you not upload your tenancy agreement?"
        And the reason "I do not have a copy of my agreement" is displayed
        And  a "Change" link is displayed for each row
        And the "Upload tenancy agreement" row is not displayed

    @AC4 @JIRA-TEST-KEY:PTSD-889
    Scenario: Verify Change link updates tenancy agreement answer
        Given the citizen is on the check your answers page
        When the citizen selects "Change" against "Do you have a copy of your tenancy agreement to upload?"
        Then the previous answer is populated
        When the citizen updates the answer
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And I click "Save and continue"
        Then the updated answer is displayed

    @AC5 @JIRA-TEST-KEY:PTSD-890
    Scenario: Complete tenancy agreement section
        Given the citizen is on the check your answers page
        When I click "Complete this section"
        Then the tenancy agreement answers are saved
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-891
    Scenario: Save tenancy agreement section for later
        Given the citizen is on the check your answers page
        When I click "Save for later"
        Then the tenancy agreement answers are saved in session
        Then check that the user is redirected to the task-list citizen dashboard page